import { map, filter, scan, distinctUntilChanged, takeUntil, mapTo } from 'rxjs/operators'
import { ISocketStream, socketStream } from '../core/socket-stream'
import { reader, IResult } from 'typescript-monads'
import { interval, Observable } from 'rxjs'
import { IProbeConfig } from '../config/config.interface'
import { Strings, Numbers } from '../core/interfaces'

type TimestampMessages = readonly TimestampedMessage[]
type StringDictionary = { readonly [key: string]: string }
interface TimestampedMessage { readonly msg: string, readonly ts: number }
interface BufferPort { readonly buffer: Buffer, readonly port: number, readonly address: string }

const flattenXml = (str: string) => str.replace(/>\s*/g, '>').replace(/\s*</g, '<')
const mapStringToBuffer = (str: string) => Buffer.from(str, 'utf8')
const distinctUntilObjectChanged = <T>(source: Observable<T>) => source.pipe(distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)))
const toArrayOfValues = <T extends StringDictionary>(source: Observable<T>) => source.pipe(map(a => Object.keys(a).map(b => a[b])))
const flattenDocumentStrings = (source: Observable<Strings>) => source.pipe(map(a => a.map(flattenXml)))
const filterOkResults = <TOk, TFail>(source: Observable<IResult<TOk, TFail>>) => source.pipe(filter(a => a.isOk()))
const timestamp = <TFail>(source: Observable<IResult<Buffer, TFail>>) => source.pipe(map<IResult<Buffer, TFail>, TimestampedMessage>(a => ({ msg: a.unwrap().toString(), ts: Date.now() })))
const accumulateFreshMessages =
  (falloutTime: number) =>
    (source: Observable<TimestampedMessage>) =>
      source.pipe(scan((acc, val) => [...acc, val].filter(a => a.ts > Date.now() - falloutTime), [] as TimestampMessages))
const mapStrToDictionary =
  (mapFn: (msg: TimestampMessages) => StringDictionary) =>
    (source: Observable<TimestampMessages>) =>
      source.pipe(map(mapFn))

export const flattenBuffersWithInfo =
  (ports: Numbers) =>
    (address: string) =>
      (buffers: readonly Buffer[]) =>
        ports.reduce((acc, port) =>
          [...acc, ...buffers.map(buffer => ({ buffer, port, address }))], [] as readonly BufferPort[])

export const initSocketStream = reader<IProbeConfig, ISocketStream>(c => socketStream('udp4', c.probeTimeoutMs, c.distinctFilterFn))

export const probe =
  (socket: ISocketStream) =>
    (ports: Numbers) =>
      (address: string) =>
        (messagesToSend: Strings = []) =>
          (mapFn: (msg: readonly TimestampedMessage[]) => StringDictionary) =>
            reader<IProbeConfig, Observable<Strings>>(cfg => {
              interval(cfg.sampleIntervalMs).pipe(
                mapTo(flattenBuffersWithInfo(ports)(address)(messagesToSend.map(mapStringToBuffer))),
                takeUntil(socket.close$))
                .subscribe(bfrPorts => bfrPorts.forEach(mdl => socket.socket.send(mdl.buffer, 0, mdl.buffer.length, mdl.port, mdl.address)))

              return socket.messages$.pipe(
                filterOkResults,
                timestamp,
                accumulateFreshMessages(cfg.falloutMs),
                mapStrToDictionary(mapFn),
                distinctUntilObjectChanged,
                toArrayOfValues,
                flattenDocumentStrings
              )
            })
