import { PROBE_REQUEST_SAMPLE_RATE_MS, PROBE_MULTICAST_ADDRESS, PROBE_SOCKET_PROTOCOL, PROBE_PORTS, PROBE_RESPONSE_TIMEOUT_MS, PROBE_RESPONSE_FALLOUT_MS, PROBE_RESULT_DEDUPE_FN } from './core.tokens'
import { Strings, Numbers, TimestampedMessage, TimestampMessages, StringDictionary } from './interfaces'
import { shareReplay, map, distinctUntilChanged, mapTo, takeUntil, scan } from 'rxjs/operators'
import { Observable, Observer, fromEvent, timer, Subject } from 'rxjs'
import { createSocket, RemoteInfo, SocketType } from 'dgram'
import { Injectable, Inject } from 'injection-js'

type IMessage = readonly [Buffer, RemoteInfo]
interface BufferPort { readonly buffer: Buffer, readonly port: number, readonly address: string }

@Injectable()
export class UdpProbe {
  constructor(
    @Inject(PROBE_REQUEST_SAMPLE_RATE_MS) private readonly requestSampleRate: number,
    @Inject(PROBE_RESPONSE_TIMEOUT_MS) private readonly responseTimeoutMs: number,
    @Inject(PROBE_RESPONSE_FALLOUT_MS) private readonly responseFalloutMs: number,
    @Inject(PROBE_RESULT_DEDUPE_FN) private readonly dedupeFn: (msg: TimestampMessages) => StringDictionary,
    @Inject(PROBE_MULTICAST_ADDRESS) private readonly multicastAddress: string,
    @Inject(PROBE_SOCKET_PROTOCOL) private readonly socketProtocol: SocketType,
    @Inject(PROBE_PORTS) private readonly ports: readonly number[]) { }

  private mapStringToBuffer(str: string) {
    return Buffer.from(str, 'utf8')
  }

  private flattenXml(str: string) {
    return str.replace(/>\s*/g, '>').replace(/\s*</g, '<')
  }

  private toArrayOfValues<T extends StringDictionary>(source: Observable<T>) {
    return source.pipe(map(a => Object.keys(a).map(b => a[b])))
  }

  private flattenDocumentStrings(source: Observable<Strings>) {
    return source.pipe(map(a => a.map(this.flattenXml)))
  }

  private timestamp(source: Observable<Buffer>) {
    return source.pipe(map<Buffer, TimestampedMessage>(a => ({ msg: a.toString(), ts: Date.now() })))
  }

  private distinctUntilObjectChanged<T>(source: Observable<T>) {
    return source.pipe(distinctUntilChanged((a, b) => {
      const keys1 = Object.keys(a)
      const keys2 = Object.keys(b)

      return keys1.length === keys2.length &&
        keys1.reduce((acc: boolean, curr) => acc === false ? false : keys2.includes(curr) as boolean, true)
    }))
  }

  private accumulateFreshMessages(falloutTime: number) {
    return function innerAccumulateFreshMessages(source: Observable<TimestampedMessage>) {
      return source.pipe(scan((acc, val) => [...acc, val].filter(a => a.ts > Date.now() - falloutTime), [] as TimestampMessages))
    }
  }

  private mapStrToDictionary(mapFn: (msg: TimestampMessages) => StringDictionary) {
    return function dd(source: Observable<TimestampMessages>) {
      return source.pipe(map(mapFn))
    }
  }

  private flattenBuffersWithInfo(ports: Numbers, address: string, buffers: readonly Buffer[]) {
    return ports.reduce((acc, port) =>
      [...acc, ...buffers.map(buffer => ({ buffer, port, address }))], [] as readonly BufferPort[])
  }

  public start(messages: Strings): Observable<Strings> {
    return Observable.create((obs: Observer<Strings>) => {
      const socket = createSocket({ type: this.socketProtocol })
      const socketMessages$ = fromEvent<IMessage>(socket, 'message').pipe(map(a => a[0]), shareReplay(1))
      const internalLimit = new Subject()

      socket.on('err', err => obs.error(err))
      socket.on('close', () => obs.complete())

      timer(0, this.requestSampleRate).pipe(
        mapTo(this.flattenBuffersWithInfo(this.ports, this.multicastAddress, messages.map(this.mapStringToBuffer))),
        takeUntil(internalLimit))
        .subscribe(bfrPorts => {
          bfrPorts.forEach(mdl => socket.send(mdl.buffer, 0, mdl.buffer.length, mdl.port, mdl.address))
        })

      socketMessages$.pipe(
        this.timestamp,
        this.accumulateFreshMessages(this.responseFalloutMs),
        this.mapStrToDictionary(this.dedupeFn),
        this.distinctUntilObjectChanged,
        this.toArrayOfValues,
        this.flattenDocumentStrings,
        takeUntil(internalLimit)
      ).subscribe(msg => obs.next(msg), err => obs.next(err))

      return function unsubscribe() {
        internalLimit.next()
        internalLimit.complete()
        socket.close()
      }
    })
  }
}