import { map, takeUntil, repeatWhen, first, flatMap, shareReplay, tap } from 'rxjs/operators'
import { createSocket, SocketType } from 'dgram'
import { fromEvent, timer, race, throwError, of, bindNodeCallback, Subject } from 'rxjs'
import { AddressInfo } from 'net'

// tslint:disable:readonly-array
export const socketStream =
  (type: SocketType) =>
    (timeout: number) => {
      const socket = createSocket({ type })
      const close = new Subject()
      const close$ = close.pipe(shareReplay(1))
      socket.on('close', () => close.next())
      // const close$ = fromEvent(socket, 'close').pipe(first(), tap(console.log))
      // const error$ = fromEvent(socket, 'error').pipe(first())
      const socketMessages$ = fromEvent<[Buffer, AddressInfo]>(socket, 'message').pipe(
        map(a => a[0]),
        shareReplay(1)
      )
      const timeout$ = timer(timeout, timeout)
        .pipe(
          takeUntil(close$),
          repeatWhen(() => socketMessages$))

      const messages$ = race(socketMessages$, timeout$).pipe(
        tap(a => !(a instanceof Buffer) && socket.close()),
        flatMap(a => a instanceof Buffer 
          ? of(a) 
          : throwError(new Error(`Timed out after ${timeout}ms`))),
        shareReplay(1))

      return {
        socket,
        messages$,
        // error$,
        close$
      }
    }