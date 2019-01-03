import { createSocket, SocketType } from 'dgram'
import { Observable, Observer, Subject, interval } from 'rxjs'
import { AddressInfo } from 'net'
import { startWith, filter, switchMap, mapTo } from 'rxjs/operators'

export interface SocketMessage {
  readonly buffer: Buffer
  readonly info: AddressInfo
}

export const socketStream =
  (socketType: SocketType = 'udp4') =>
    (timeout: number) => {
      const socket = createSocket({ type: socketType })
      const stream: Observable<SocketMessage> = Observable.create((obs: Observer<any>) => {
        const reset_ = new Subject()
        const stop_ = new Subject()

        reset_.pipe(
          startWith(true),
          switchMap(_ => interval(timeout).pipe(mapTo(true))),
          filter(Boolean)
        ).subscribe(() => {
          obs.next({
            buffer: Buffer.alloc(0),
            info: undefined as any
          })
        })

        socket.on('error', err => obs.error(err))
        socket.on('message', (buffer, info) => {
          reset_.next(false)
          obs.next({
            buffer,
            info
          })
        })

        socket.on('close', (_: any) => {
          stop_.next()
          obs.complete()
        })
      })

      return {
        socket,
        stream
      }
    }
