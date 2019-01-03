import { timer, Observable } from 'rxjs'
import { socketStream } from './socket-stream'
import { maybe, reader, IMaybe } from 'typescript-monads'
import { map, distinctUntilChanged, scan } from 'rxjs/operators'
import { IProbeConfig, DEFAULT_CONFIG } from './config'
import { probePayload } from './probe-payload'
import { IONVIFDevice } from './device'

const parseXmlResponse = () => {

}

const uniqueObjects =
  (arr: ReadonlyArray<any>) =>
    arr.filter((object, index) => index === arr.findIndex(obj => JSON.stringify(obj) === JSON.stringify(object)))

export const probeONVIFDevices = () => reader<Partial<IProbeConfig>, Observable<ReadonlyArray<IONVIFDevice>>>(partialConfig => {
  const config: IProbeConfig = { ...DEFAULT_CONFIG, ...partialConfig }

  const ss = socketStream()(config.PROBE_NETWORK_TIMEOUT_MS)

  const socketMessages = ss.stream
    .pipe(
      map(a => a.buffer),
      distinctUntilChanged((a, b) => a.length === b.length && a !== b),
      map(buf => buf.length ? maybe<string>(buf.toString()) : maybe<string>())
    )

  timer(config.PROBE_SAMPLE_START_DELAY_TIME_MS, config.PROBE_SAMPLE_TIME_MS)
    // TODO: takeUntil to cancel this obs!
    .subscribe(_ => {
      config.ONVIF_DEVICES
        .map(probePayload())
        .map(xml => Buffer.from(xml, 'utf8'))
        .forEach(buffer => ss.socket.send(buffer, 0, buffer.length, config.PORT, config.MULTICAST_ADDRESS))
    })

  return socketMessages
    .pipe(
      map(xmlResponse => {
        return xmlResponse
          .map(r => config.DOM_PARSER.parseFromString(r, 'application/xml'))
          .map(p => {
            const simpleParse = (elm: string) => maybe(p.getElementsByTagName(elm).item(0))
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
              xaddrs,
              ts: Date.now()
            }
          })
      }),
      scan<IMaybe<IONVIFDevice>, ReadonlyArray<IONVIFDevice>>((acc, curr) => {
        const tsNow = Date.now()
        const cleaned = acc.filter((c: any) => c.ts < tsNow)
        return uniqueObjects(curr.match({
          some: (cam: any) => {
            const { ts, ...noTs } = cam
            return [...cleaned, noTs]
          },
          none: () => [...cleaned]
        }))
      }, [])
    )
})

probeONVIFDevices()
  .run({})
  .subscribe(console.log, console.error)
