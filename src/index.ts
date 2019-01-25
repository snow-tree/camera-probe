import { map, distinctUntilChanged, takeUntil, mergeScan } from 'rxjs/operators'
import { maybe, reader, IMaybe } from 'typescript-monads'
import { IProbeConfig, DEFAULT_CONFIG } from './config'
import { timer, Observable, forkJoin } from 'rxjs'
import { parseXmlResponse } from './parse'
import { socketStream } from './socket-stream'
import { probePayload } from './probe-payload'
import { IONVIFDevice } from './device'
export { IProbeConfig } from './config'
import { MD5 } from 'object-hash'
import { ping } from 'ping-rx'
export { IONVIFDevice }
export { DEFAULT_CONFIG }

const uniqueObjects =
  (arr: ReadonlyArray<any>) =>
    arr.filter((object, index) => index === arr.findIndex(obj => JSON.stringify(obj) === JSON.stringify(object)))

type ProbeStream = Observable<ReadonlyArray<IONVIFDevice>>

export const probeONVIFDevices = () => reader<Partial<IProbeConfig>, ProbeStream>(partialConfig => {
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
      map(xmlResponse => xmlResponse
        .map(xmlString => config.DOM_PARSER.parseFromString(xmlString, 'application/xml'))
        .map(xmlDoc => parseXmlResponse(xmlDoc)(config))),
      mergeScan<IMaybe<IONVIFDevice>, ReadonlyArray<IONVIFDevice>>((acc, curr) => {
        return forkJoin([...acc, curr.valueOrUndefined() as IONVIFDevice].filter(Boolean).map(device => ping(device.ip)()(config.PROBE_NETWORK_TIMEOUT_MS).pipe(
          map(v => v.isOk()
            ? { include: true, device }
            : { include: false, device }))))
          .pipe(
            map(b => uniqueObjects([
              ...acc.filter(a => b.filter(c => c.include === false).map(a => a.device.deviceServiceUri).some(c => c !== a.deviceServiceUri)),
              ...b.filter(a => a.include).map(c => c.device)
            ])))
      }, []),
      distinctUntilChanged((a, b) => MD5(a) === MD5(b)))
})

export const startProbingONVIFDevices = () => probeONVIFDevices().run({})

export const startProbingONVIFDevicesCli = () => startProbingONVIFDevices()
  .subscribe(v => {
    console.log('\n')
    console.log('Watching for connected ONVIF devices...', '\n')
    console.log(v)
  })
  