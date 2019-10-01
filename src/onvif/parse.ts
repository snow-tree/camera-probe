import { maybe } from 'typescript-monads'
import { IOnvifDevice } from './device'

const SCHEMAS = {
  addressing: 'http://schemas.xmlsoap.org/ws/2004/08/addressing',
  discovery: 'http://schemas.xmlsoap.org/ws/2005/04/discovery'
}

export const maybeIpAddress = (str: string) => maybe(str.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/)).map(a => a[0])

export const xmlToOnvifDevice = (doc: Document) => (notfoundStr = ''): IOnvifDevice => {
  const simpleParse = (elm: Document | Element) => (ns: string) => (node: string) => maybe(elm.getElementsByTagNameNS(ns, node).item(0))
  const maybeRootProbeElement = maybe(doc.getElementsByTagNameNS(SCHEMAS.discovery, 'ProbeMatch').item(0))

  return maybeRootProbeElement.map<IOnvifDevice>(rootElement => {
    const parseProbeElements = simpleParse(rootElement)
    const parseProbeDiscoveryElements = parseProbeElements(SCHEMAS.discovery)
    const parseProbeAddressingElements = parseProbeElements(SCHEMAS.addressing)
    

    const scopeParser = (scopes: readonly string[]) => (pattern: string) =>
      maybe(scopes.find(a => a.toLowerCase().includes(`onvif://www.onvif.org/${pattern}`.toLocaleLowerCase()))).flatMapAuto(a => a.split('/').pop())

    const scopes = parseProbeDiscoveryElements('Scopes').flatMapAuto(a => a.textContent).map(a => a.split(' ')).valueOr([])
    const xaddrs = parseProbeDiscoveryElements('XAddrs').flatMapAuto(a => a.textContent).map(a => a.split(' ')).valueOr([])
    const metadataVersion = parseProbeDiscoveryElements('MetadataVersion').flatMapAuto(a => a.textContent).valueOr(notfoundStr)

    const scopeParse = scopeParser(scopes)
    const valueFromScope = (str: string) => scopeParse(str).valueOr(notfoundStr)

    const urn = parseProbeAddressingElements('Address')
      .flatMapAuto(a => a.textContent)
      .map(a => a.split(':').pop() || '')
      .valueOr(notfoundStr)

    const profiles = scopes
      .filter(a => a.includes(`onvif://www.onvif.org/Profile`))
      .map(b => b.split('/').pop())
      .filter<string>(Boolean as any)

    const deviceServiceUri = maybe(xaddrs
      .find(a => a.includes(`onvif/device_service`)))
      .valueOr('0.0.0.0')

    const ip = maybeIpAddress(deviceServiceUri).valueOr(deviceServiceUri)

    return {
      name: valueFromScope('name'),
      hardware: scopeParse('hardware').match({
        none: () => valueFromScope('model'),
        some: val => val
      }),
      location: valueFromScope('location'),
      deviceServiceUri,
      ip,
      metadataVersion,
      urn,
      scopes,
      profiles,
      xaddrs
    }
  }).valueOr({
    name: notfoundStr,
    hardware: notfoundStr,
    location: notfoundStr,
    deviceServiceUri: notfoundStr,
    ip: notfoundStr,
    metadataVersion: notfoundStr,
    urn: notfoundStr,
    scopes: [],
    profiles: [],
    xaddrs: []
  })
}