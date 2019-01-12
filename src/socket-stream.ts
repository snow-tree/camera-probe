import { createSocket, SocketType } from 'dgram'
import { Observable, Observer, Subject, interval } from 'rxjs'
import { AddressInfo } from 'net'
import { startWith, filter, switchMap, mapTo, takeUntil } from 'rxjs/operators'

export interface SocketMessage {
  readonly buffer: Buffer
  readonly info: AddressInfo
}

export const socketStream =
  (socketType: SocketType = 'udp4') =>
    (timeout: number) => {
      const socket = createSocket({ type: socketType })
      const stopSource = new Subject<any>()
      const stop = stopSource.asObservable()

      const stream: Observable<SocketMessage> = Observable.create((obs: Observer<any>) => {
        const reset = new Subject<any>()
        reset.pipe(
          startWith(true),
          switchMap(_ => interval(timeout).pipe(mapTo(true))),
          filter(Boolean),
          takeUntil(stop)
        ).subscribe(() => {
          obs.next({
            buffer: Buffer.alloc(0),
            info: undefined as any
          })
        })

        socket.on('error', err => obs.error(err))
        socket.on('message', (buffer, info) => {
          reset.next(false)
          obs.next({
            buffer,
            info
          })
        })

        socket.on('close', (_: any) => {
          stopSource.next()
          stopSource.complete()
          obs.complete()
        })
      })

      return {
        socket,
        stream,
        stop
      }
    }
