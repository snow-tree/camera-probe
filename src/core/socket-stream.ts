import { takeUntil, repeatWhen, shareReplay } from 'rxjs/operators'
import { createSocket, SocketType } from 'dgram'
import { Subject, timer } from 'rxjs'

export const socketStream =
  (type: SocketType) =>
    (timeout: number) => {
      const socket = createSocket({ type })
      const stopSource = new Subject()
      const msgSource = new Subject<Buffer>()
      const messages$ = msgSource.pipe(shareReplay(1))

      socket.on('close', (_: any) => {
        stopSource.next()
        stopSource.complete()
      })

      socket.on('error', err => msgSource.error(err))
      socket.on('message', buffer => msgSource.next(buffer))
      
      timer(timeout, timeout)
        .pipe(
          takeUntil(stopSource),
          repeatWhen(() => messages$)
        ).subscribe(_ => {
          msgSource.error(new Error(`Timed out after ${timeout}ms`))
          socket.close()
        })

      return {
        socket,
        messages$
      }
    }
