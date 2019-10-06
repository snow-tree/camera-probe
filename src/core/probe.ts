import { createSocket, RemoteInfo } from 'dgram'
import { Strings, Numbers, IProbeConfig, DEFAULT_PROBE_CONFIG } from './interfaces'
import { Observable, Observer, fromEvent, timer } from 'rxjs'
import { shareReplay, map, distinctUntilChanged, mapTo, takeUntil, scan } from 'rxjs/operators'

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

  return keys1.length === keys2.length &&
    keys1.reduce((acc: boolean, curr) => acc === false ? false : keys2.includes(curr) as boolean, true)
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
  (config?: Partial<IProbeConfig>) =>
    (messages: Strings) =>
      (until: Observable<any>): Observable<Strings> =>
        Observable.create((obs: Observer<Strings>) => {
          const cfg = { ...DEFAULT_PROBE_CONFIG, ...(config || {}) }
          const socket = createSocket({ type: 'udp4' })
          const socketMessages$ = fromEvent<IMessage>(socket, 'message').pipe(map(a => a[0]), shareReplay(1))
          
          socket.on('err', err => obs.error(err))
          socket.on('close', () => obs.complete())
          
          timer(0, cfg.PROBE_REQUEST_SAMPLE_RATE_MS).pipe(
            mapTo(flattenBuffersWithInfo(cfg.PORTS)(cfg.MULTICAST_ADDRESS)(messages.map(mapStringToBuffer))),
            takeUntil(until))
            .subscribe(bfrPorts => {
              bfrPorts.forEach(mdl => socket.send(mdl.buffer, 0, mdl.buffer.length, mdl.port, mdl.address))
            })

          socketMessages$.pipe(
            timestamp,
            accumulateFreshMessages(cfg.PROBE_RESPONSE_FALLOUT_MS),
            mapStrToDictionary(cfg.RESULT_DEDUPE_FN),
            distinctUntilObjectChanged,
            toArrayOfValues,
            flattenDocumentStrings,
            takeUntil(until)
          ).subscribe(msg => obs.next(msg), undefined, () => {
            setTimeout(() => {
              socket.close()
            }, 1000)
          })
        })
