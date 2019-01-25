import { timer, Observable, forkJoin, of } from 'rxjs'
import { socketStream } from './socket-stream'
import { maybe, reader, IMaybe } from 'typescript-monads'
import { map, distinctUntilChanged, takeUntil, mergeScan } from 'rxjs/operators'
import { IProbeConfig, DEFAULT_CONFIG } from './config'
import { probePayload } from './probe-payload'
import { IONVIFDevice } from './device'
import { parseXmlResponse } from './parse'
export { IProbeConfig } from './config'
export { IONVIFDevice }
export { DEFAULT_CONFIG }
import { MD5 } from 'object-hash'
import { ping } from 'ping-rx'

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
      map(xmlResponse => xmlResponse
        .map(r => config.DOM_PARSER.parseFromString(r, 'application/xml'))
        .map(p => parseXmlResponse(p)(config))),
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
      distinctUntilChanged((a, b) => MD5(a) === MD5(b)),
    )
})

export const startProbingONVIFDevices = () => probeONVIFDevices().run({})

export const startProbingONVIFDevicesCli = () => startProbingONVIFDevices()
  .subscribe(v => {
    console.log('\n')
    console.log('Watching for connected ONVIF devices...', '\n')
    console.log(v)
  })

startProbingONVIFDevices().subscribe(console.log)