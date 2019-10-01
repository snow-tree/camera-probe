import { map, filter, scan, distinctUntilChanged, takeUntil } from 'rxjs/operators'
import { generateWsDiscoveryProbePayload } from './payload'
import { ISocketStream, socketStream } from '../core/socket-stream'
import { reader, maybe, IResult } from 'typescript-monads'
import { interval, Observable } from 'rxjs'
import { IProbeConfig } from '../config/config.probe'
import { generateGuid } from '../core/guid'

type TimestampMessages = readonly TimestampedMessage[]
type StringDictionary = { readonly [key: string]: string }
type Strings = readonly string[]
interface TimestampedMessage { readonly msg: string, readonly ts: number }
interface BufferPort { readonly buffer: Buffer, readonly port: number, readonly address: string }

const mapStrXmlToBuffer = (str: string) => Buffer.from(str, 'utf8')
const mapDeviceStrToPayload = (str: string) => generateWsDiscoveryProbePayload(str)(generateGuid())
const mapDevicesToPayloads = (devices: readonly string[]) => devices.map(mapDeviceStrToPayload).map(mapStrXmlToBuffer)
const distinctUntilObjectChanged = <T>(source: Observable<T>) => source.pipe(distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)))
const toArrayOfValues = <T extends StringDictionary>(source: Observable<T>) => source.pipe(map(a => Object.keys(a).map(b => a[b])))
const filterOkResults = <TOk, TFail>(source: Observable<IResult<TOk, TFail>>) => source.pipe(filter(a => a.isOk()))
const timestamp = <TFail>(source: Observable<IResult<Buffer, TFail>>) => source.pipe(map<IResult<Buffer, TFail>, TimestampedMessage>(a => ({ msg: a.unwrap().toString(), ts: Date.now() })))
const accumulateFreshMessages =
  (falloutTime: number) =>
    (source: Observable<TimestampedMessage>) =>
      source.pipe(scan((acc, val) => [...acc, val].filter(a => a.ts > Date.now() - falloutTime), [] as TimestampMessages))

export const flattenBuffersWithInfo =
  (ports: readonly number[]) =>
    (buffers: readonly Buffer[]) =>
      (address: string) =>
        ports.reduce((acc, port) =>
          [...acc, ...buffers.map(buffer => ({ buffer, port, address }))], [] as readonly BufferPort[])

export const initSocketStream = reader<IProbeConfig, ISocketStream>(c => socketStream(c.protocol, c.probeTimeoutMs, c.distinctFilterFn))

export const probe = (socket: ISocketStream) => reader<IProbeConfig, Observable<Strings>>(c => {
  // this should be interval based to keep polling?
  interval(5000).pipe(takeUntil(socket.close$)).subscribe(() => {
    flattenBuffersWithInfo(c.ports)(mapDevicesToPayloads(c.onvifDeviceTypes))(c.address)
      .forEach(mdl => socket.socket.send(mdl.buffer, 0, mdl.buffer.length, mdl.port, mdl.address))
  })

  return socket.messages$.pipe(
    filterOkResults,
    timestamp,
    accumulateFreshMessages(c.falloutMs),
    map(a => a.reduce((acc, item) =>
      maybe(item.msg.match(/urn:uuid:.*?</g))
        .flatMapAuto(a => a[0].replace('<', '').split(':').pop())
        .filter(key => !acc[key])
        .map(key => ({ ...acc, [key]: item.msg }))
        .valueOr(acc), {} as StringDictionary)),
    distinctUntilObjectChanged,
    toArrayOfValues
  )
})
