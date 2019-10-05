import { reader } from 'typescript-monads'
import { IProbeConfig } from '..'
import { Observable, Observer, fromEvent, timer } from 'rxjs'
import { Strings, Numbers } from './interfaces'
import { createSocket, RemoteInfo } from 'dgram'
import { first, shareReplay, map, distinctUntilChanged, mapTo, takeWhile, takeUntil, scan } from 'rxjs/operators'

type IMessage = readonly [Buffer, RemoteInfo]
type TimestampMessages = readonly TimestampedMessage[]
type StringDictionary = { readonly [key: string]: string }
interface TimestampedMessage { readonly msg: string, readonly ts: number }
interface BufferPort { readonly buffer: Buffer, readonly port: number, readonly address: string }

const mapStringToBuffer = (str: string) => Buffer.from(str, 'utf8')
const flattenXml = (str: string) => str.replace(/>\s*/g, '>').replace(/\s*</g, '<')
const toArrayOfValues = <T extends StringDictionary>(source: Observable<T>) => source.pipe(map(a => Object.keys(a).map(b => a[b])))
const flattenDocumentStrings = (source: Observable<Strings>) => source.pipe(map(a => a.map(flattenXml)))
const timestamp = (source: Observable<Buffer>) => source.pipe(map<Buffer, TimestampedMessage>(a => ({ msg: a.toString(), ts: Date.now() })))
const distinctUntilObjectChanged = <T>(source: Observable<T>) => source.pipe(distinctUntilChanged((a, b) => {
  const keys1 = Object.keys(a)
  const keys2 = Object.keys(b)

  return keys1.length === keys2.length && keys1.reduce((acc: boolean, curr) => {
    return acc === false ? false : keys2.includes(curr) as boolean
  }, true)
}))

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

export const probe =
  (ports: Numbers) =>
    (address: string) =>
      (messages: readonly string[]) =>
        (mapFn: (msg: readonly TimestampedMessage[]) => StringDictionary) =>
          (distinctFilterFn?: (prev: string, curr: string) => boolean) =>
            reader<IProbeConfig, Observable<Strings>>(cfg => Observable.create((obs: Observer<readonly string[]>) => {
              const socket = createSocket({ type: 'udp4' })
              const socketClosed$ = fromEvent<void>(socket, 'close').pipe(first(), shareReplay(1))
              const socketMessages$ = fromEvent<IMessage>(socket, 'message').pipe(
                map(a => a[0]),
                distinctUntilChanged((prev, curr) => (typeof distinctFilterFn === 'function' && !!distinctFilterFn(prev.toString(), curr.toString()))),
                shareReplay(1))

              timer(0, cfg.PROBE_SAMPLE_TIME_MS).pipe(
                mapTo(flattenBuffersWithInfo(ports)(address)(messages.map(mapStringToBuffer))),
                takeWhile(() => !obs.closed),
                takeUntil(socketClosed$))
                .subscribe(bfrPorts => bfrPorts.forEach(mdl => socket.send(mdl.buffer, 0, mdl.buffer.length, mdl.port, mdl.address)))

              socketMessages$.pipe(
                timestamp,
                accumulateFreshMessages(cfg.FALLOUT_MS),
                mapStrToDictionary(mapFn),
                distinctUntilObjectChanged,
                toArrayOfValues,
                flattenDocumentStrings
              ).subscribe(msg => obs.next(msg))
            }))
