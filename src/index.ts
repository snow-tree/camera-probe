import { timer, Observable } from 'rxjs'
import { socketStream } from './socket-stream'
import { maybe, reader, IMaybe } from 'typescript-monads'
import { map, distinctUntilChanged, scan, takeUntil } from 'rxjs/operators'
import { IProbeConfig, DEFAULT_CONFIG } from './config'
import { probePayload } from './probe-payload'
import { IONVIFDevice } from './device'
import { parseXmlResponse } from './parse'

export { IProbeConfig } from './config'
export { IONVIFDevice }

type IONVIFDeviceWithTimestamp = IONVIFDevice & { readonly ts: number }

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
    .pipe(
      takeUntil(ss.stop),
      map(_ => config.ONVIF_DEVICES
        .map(probePayload())
        .map(xml => Buffer.from(xml, 'utf8'))
      )
    )
    .subscribe(buffers => {
      buffers.forEach(b => ss.socket.send(b, 0, b.length, config.PORT, config.MULTICAST_ADDRESS))
    })

  return socketMessages
    .pipe(
      map(xmlResponse => {
        return xmlResponse
          .map(r => config.DOM_PARSER.parseFromString(r, 'application/xml'))
          .map(p => {
            return {
              ...parseXmlResponse(p)(config),
              ts: Date.now()
            }
          })
      }),
      scan<IMaybe<IONVIFDeviceWithTimestamp>, ReadonlyArray<IONVIFDeviceWithTimestamp>>((acc, curr) => {
        const tsNow = Date.now()
        const removedStaleCameras = acc.filter(c => c.ts < tsNow)

        const accumulated = curr
          .map(cam => {
            const { ts, ...noTs } = cam
            return [...removedStaleCameras, noTs]
          })
          .valueOr(removedStaleCameras)

        return uniqueObjects(accumulated)
      }, [])
    )
})
