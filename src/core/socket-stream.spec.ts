import { socketStream } from './socket-stream'
import { createSocket } from 'dgram'
import { skip, first, catchError,  } from 'rxjs/operators'
import { Socket } from 'dgram'
import { timer } from 'rxjs'

// this just returns the sent message from the client
const initTestServer = (port = 41234) => {
  const server = createSocket('udp4')

  server.on('error', (err) => server.close())
  server.on('message', (msg, rinfo) => {
    server.send(msg, 0, msg.length, rinfo.port, rinfo.address)
  })

  server.bind(port)

  return server
}

describe('Socket Stream', () => {
  const PORT = 41234
  const SAMPLE_MSG_1 = 'I am some message being sent'
  const SAMPLE_MSG_2 = 'I am a different message'
  const SAMPLE_MSG_BUFFER_1 = Buffer.from(SAMPLE_MSG_1)
  const SAMPLE_MSG_BUFFER_2 = Buffer.from(SAMPLE_MSG_2)

  // tslint:disable-next-line:no-let
  let svr: Socket

  beforeEach(() => svr = initTestServer(PORT))
  afterEach(() => svr.close())

  it('should recieve messages', done => {
    const ss = socketStream('udp4')(4000)

    ss.messages$.pipe(first()).subscribe(res => {
      expect(res.unwrap().toString()).toEqual(SAMPLE_MSG_1)
    })
    
    ss.messages$.pipe(skip(1)).subscribe(res => {
      expect(res.unwrap().toString()).toEqual(SAMPLE_MSG_2)
      done()
    })

    ss.socket.send(SAMPLE_MSG_BUFFER_1, 0, SAMPLE_MSG_BUFFER_1.length, PORT)
    ss.socket.send(SAMPLE_MSG_BUFFER_2, 0, SAMPLE_MSG_BUFFER_2.length, PORT)
  })

  it('should recieve distinct messages', done => {
    const ss = socketStream('udp4')(4000)
    expect.assertions(1)

    ss.messages$.pipe(first()).subscribe(res => {
      expect(res.unwrap().toString()).toEqual(SAMPLE_MSG_1)
      done()
    })
    
    ss.messages$.pipe(skip(1)).subscribe(res => {
      expect(res.unwrap().toString()).toEqual(SAMPLE_MSG_1)
    })

    ss.socket.send(SAMPLE_MSG_BUFFER_1, 0, SAMPLE_MSG_BUFFER_1.length, PORT)
    ss.socket.send(SAMPLE_MSG_BUFFER_1, 0, SAMPLE_MSG_BUFFER_1.length, PORT)
  })

  it('should handle timeouts', done => {
    const TIMEOUT = 0
    const ss = socketStream('udp4')(TIMEOUT)

    ss.messages$.subscribe(res => {
      expect(res.unwrapFail()).toEqual(`Timed out after ${TIMEOUT}ms`)
      done()
    })
  })

  it('should send close event', done => {
    socketStream('udp4')(0).close$.subscribe(_ => {
      expect(true).toEqual(true)
      done()
    })
  })
})