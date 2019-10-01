import { map, takeUntil, repeatWhen, first, shareReplay, tap, distinctUntilChanged } from 'rxjs/operators'
import { createSocket, SocketType, RemoteInfo, Socket } from 'dgram'
import { fromEvent, timer, race, Observable } from 'rxjs'
import { ok, fail, IResult } from 'typescript-monads'

type IMessage = readonly [Buffer, RemoteInfo]
export interface ISocketStream {
  readonly socket: Socket
  readonly messages$: Observable<IResult<Buffer, string>>
  readonly close$: Observable<void>
}

export const socketStream = (type: SocketType, timeout: number, distinctFilterFn?: (prev: string, curr: string) => boolean): ISocketStream => {
  const socket = createSocket({ type })
  const close$ = fromEvent<void>(socket, 'close').pipe(first())
  const socketMessages$ = fromEvent<IMessage>(socket, 'message').pipe(
    map(a => a[0]),
    distinctUntilChanged((prev, curr) => (typeof distinctFilterFn === 'function' && !!distinctFilterFn(prev.toString(), curr.toString()))),
    shareReplay(1)
  )

  const messages$ = race(socketMessages$, timer(timeout, timeout).pipe(
    takeUntil(close$),
    repeatWhen(() => socketMessages$))).pipe(
      tap(a => !(a instanceof Buffer) && socket.close()),
      map<Buffer | number, IResult<Buffer, string>>(a => a instanceof Buffer
        ? ok(a)
        : fail(`Timed out after ${timeout}ms`)),
      shareReplay(1))

  messages$.pipe(takeUntil(close$)).subscribe()

  return {
    socket,
    messages$,
    close$
  }
}