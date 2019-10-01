import { ISocketStream, socketStream } from '../core/socket-stream'
import { generateWsDiscoveryProbePayload } from './payload'
import { generateGuid } from '../core/guid'
import { map, filter, scan, distinctUntilChanged, takeUntil } from 'rxjs/operators'
import { interval, Observable, timer } from 'rxjs'
import { reader, maybe, IResult } from 'typescript-monads'
import { IProbeConfig } from '../config/config.probe'

interface BufferPort {
  readonly buffer: Buffer
  readonly port: number
  readonly address: string
}

const mapStrXmlToBuffer = (str: string) => Buffer.from(str, 'utf8')
const mapDeviceStrToPayload = (str: string) => generateWsDiscoveryProbePayload(str)(generateGuid())
const mapDevicesToPayloads = (devices: readonly string[]) => devices.map(mapDeviceStrToPayload).map(mapStrXmlToBuffer)

export const flattenBuffersWithInfo =
  (ports: readonly number[]) =>
    (buffers: readonly Buffer[]) =>
      (address: string) =>
        ports.reduce((acc, port) =>
          [...acc, ...buffers.map(buffer => ({ buffer, port, address }))], [] as readonly BufferPort[])

export const initSocketStream =
  reader<IProbeConfig, ISocketStream>(cfg => socketStream(cfg.protocol, cfg.probeTimeoutMs, cfg.distinctFilterFn))

interface DT {
  readonly msg: string
  readonly ts: number
}
type ct = readonly DT[]
type ReadonlyStrings = readonly string[]

const distinctUntilObjectChanged = <T>(source: Observable<T>) => source.pipe(distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)))
const toArrayOfValues = <T extends { readonly [key: string]: any }>(source: Observable<T>) => source.pipe(map(a => Object.keys(a).map(b => a[b])))
const filterOkResults = <TOk, TFail>(source: Observable<IResult<TOk, TFail>>) => source.pipe(filter(a => a.isOk()))

export const probe = (socket: ISocketStream) => reader<IProbeConfig, Observable<any>>(cfg => {
  const falloutTime = 1000
  // this should be interval based to keep polling?
  interval(5000).pipe(takeUntil(socket.close$)).subscribe(() => {
    flattenBuffersWithInfo(cfg.ports)(mapDevicesToPayloads(cfg.onvifDeviceTypes))(cfg.address)
      .forEach(mdl => socket.socket.send(mdl.buffer, 0, mdl.buffer.length, mdl.port, mdl.address))
  })

  

  return socket.messages$.pipe(
    filterOkResults,
    map(a => ({ msg: a.unwrap().toString(), ts: Date.now() })),
    scan((acc, val) => [...acc, val].filter(a => a.ts > Date.now() - falloutTime), [] as ct),
    map(a => a.reduce((acc, item) => {
      return maybe(item.msg.match(/urn:uuid:.*?</g)).flatMapAuto(a => a[0].replace('<', '').split(':').pop())
        .filter(key => !acc[key])
        .map(key => {
          return {
            ...acc,
            [key]: item.msg
          }
        }).valueOr(acc)
    }, {} as { readonly [key: string]: string})),
    distinctUntilObjectChanged,
    toArrayOfValues
  )
})
