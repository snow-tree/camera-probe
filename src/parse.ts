import { IProbeConfig } from './config'
import { IONVIFDevice } from './device'
import { maybe } from 'typescript-monads'

export const parseXmlResponse = (doc: Document) => (config: IProbeConfig): IONVIFDevice => {
  const simpleParse = (elm: string) => maybe(doc.getElementsByTagName(elm).item(0))
    .flatMap(a => maybe(a.textContent))
  const scopeParser = (scopes: ReadonlyArray<string>) => (pattern: string) =>
    maybe(scopes.find(a => a.includes(`onvif://www.onvif.org/${pattern}`)))
      .flatMap(a => maybe(a.split('/').pop()))

  const scopes = simpleParse('d:Scopes').map(a => a.split(' ')).valueOr([])

  const types = simpleParse('d:Types')
    .map(a => a.split(' '))
    .map(a => a.map(b => b.split(':').pop()).filter<string>(Boolean as any))
    .valueOr([])

  const xaddrs = simpleParse('d:XAddrs').map(a => a.split(' ')).valueOr([])

  const scopeParse = scopeParser(scopes)
  const valueFromScope = (str: string) => scopeParse(str).valueOr(config.NOT_FOUND_STRING)

  const urn = simpleParse('a:Address')
    .map(a => a.replace('uuid:', ''))
    .valueOr(config.NOT_FOUND_STRING)

  const profiles = scopes
    .filter(a => a.includes(`onvif://www.onvif.org/Profile`))
    .map(b => b.split('/').pop())
    .filter<string>(Boolean as any)

  const deviceServiceUri = maybe(xaddrs
    .find(a => a.includes(`onvif/device_service`)))
    .valueOr('0.0.0.0')

  const metadataVersion = simpleParse('d:MetadataVersion').valueOr(config.NOT_FOUND_STRING)

  return {
    name: valueFromScope('name'),
    hardware: valueFromScope('hardware'),
    location: valueFromScope('location'),
    deviceServiceUri,
    metadataVersion,
    urn,
    scopes,
    profiles,
    types,
    xaddrs
  }
}