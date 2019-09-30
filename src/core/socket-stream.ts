import { map, takeUntil, repeatWhen, first, shareReplay, tap } from 'rxjs/operators'
import { createSocket, SocketType, RemoteInfo } from 'dgram'
import { fromEvent, timer, race } from 'rxjs'
import { ok, fail, IResult } from 'typescript-monads'

type IMessage = readonly [Buffer, RemoteInfo]

// tslint:disable:readonly-array
export const socketStream =
  (type: SocketType) =>
    (timeout: number) => {
      const socket = createSocket({ type })
      const close$ = fromEvent(socket, 'close').pipe(first())
      const socketMessages$ = fromEvent<IMessage>(socket, 'message').pipe(
        map(a => a[0]),
        shareReplay(1)
      )
      const timeout$ = timer(timeout, timeout)
        .pipe(
          takeUntil(close$),
          repeatWhen(() => socketMessages$))

      const messages$ = race(socketMessages$, timeout$).pipe(
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