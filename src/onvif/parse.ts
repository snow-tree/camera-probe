// import { IProbeConfig } from './config/config.app'
// import { IONVIFDevice } from './onvif/device'
// import { maybe } from 'typescript-monads'

// const SCHEMAS = {
//   addressing: 'http://schemas.xmlsoap.org/ws/2004/08/addressing',
//   discovery: 'http://schemas.xmlsoap.org/ws/2005/04/discovery'
// }

// export const maybeIpAddress = (str: string) => maybe(str.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/)).map(a => a[0])

// export const parseXmlResponse = (doc: Document) => (config: IProbeConfig): IONVIFDevice => {
//   const simpleParse = (elm: Document | Element) => (ns: string) => (node: string) => maybe(elm.getElementsByTagNameNS(ns, node).item(0))
//   const maybeRootProbeElement = maybe(doc.getElementsByTagNameNS(SCHEMAS.discovery, 'ProbeMatch').item(0))

//   return maybeRootProbeElement.map<IONVIFDevice>(rootElement => {
//     const parseProbeElements = simpleParse(rootElement)
//     const parseProbeDiscoveryElements = parseProbeElements(SCHEMAS.discovery)
//     const parseProbeAddressingElements = parseProbeElements(SCHEMAS.addressing)

//     const scopeParser = (scopes: readonly string[]) => (pattern: string) =>
//       maybe(scopes.find(a => a.toLowerCase().includes(`onvif://www.onvif.org/${pattern}`.toLocaleLowerCase()))).flatMapAuto(a => a.split('/').pop())

//     const scopes = parseProbeDiscoveryElements('Scopes').flatMapAuto(a => a.textContent).map(a => a.split(' ')).valueOr([])
//     const xaddrs = parseProbeDiscoveryElements('XAddrs').flatMapAuto(a => a.textContent).map(a => a.split(' ')).valueOr([])
//     const metadataVersion = parseProbeDiscoveryElements('MetadataVersion').flatMapAuto(a => a.textContent).valueOr(config.NOT_FOUND_STRING)

//     const scopeParse = scopeParser(scopes)
//     const valueFromScope = (str: string) => scopeParse(str).valueOr(config.NOT_FOUND_STRING)

//     const urn = parseProbeAddressingElements('Address')
//       .flatMapAuto(a => a.textContent)
//       .map(a => a.split(':').pop() || '')
//       .valueOr(config.NOT_FOUND_STRING)

//     const profiles = scopes
//       .filter(a => a.includes(`onvif://www.onvif.org/Profile`))
//       .map(b => b.split('/').pop())
//       .filter<string>(Boolean as any)

//     const deviceServiceUri = maybe(xaddrs
//       .find(a => a.includes(`onvif/device_service`)))
//       .valueOr('0.0.0.0')

//     const ip = maybeIpAddress(deviceServiceUri).valueOr(deviceServiceUri)

//     return {
//       name: valueFromScope('name'),
//       hardware: scopeParse('hardware').match({
//         none: () => valueFromScope('model'),
//         some: val => val
//       }),
//       location: valueFromScope('location'),
//       deviceServiceUri,
//       ip,
//       metadataVersion,
//       urn,
//       scopes,
//       profiles,
//       xaddrs
//     }
//   }).valueOr({
//     name: config.NOT_FOUND_STRING,
//     hardware: config.NOT_FOUND_STRING,
//     location: config.NOT_FOUND_STRING,
//     deviceServiceUri: config.NOT_FOUND_STRING,
//     ip: config.NOT_FOUND_STRING,
//     metadataVersion: config.NOT_FOUND_STRING,
//     urn: config.NOT_FOUND_STRING,
//     scopes: [],
//     profiles: [],
//     xaddrs: []
//   })
// }