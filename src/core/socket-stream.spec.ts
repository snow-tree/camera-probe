import { socketStream } from './socket-stream'
import { createSocket } from 'dgram'
import { skip, first } from 'rxjs/operators'

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

  it('should recieve messages', done => {
    const svr = initTestServer(PORT)
    const ss = socketStream('udp4')(4000)

    ss.messages$.pipe(first()).subscribe(res => {
      expect(res.toString()).toEqual(SAMPLE_MSG_1)
    }, _err => expect(true).toEqual(false))
    
    ss.messages$.pipe(skip(1)).subscribe(res => {
      svr.close()
      expect(res.toString()).toEqual(SAMPLE_MSG_2)
      done()
    }, _err => expect(true).toEqual(false))

    ss.socket.send(SAMPLE_MSG_BUFFER_1, 0, SAMPLE_MSG_BUFFER_1.length, PORT, '0.0.0.0')
    ss.socket.send(SAMPLE_MSG_BUFFER_2, 0, SAMPLE_MSG_BUFFER_2.length, PORT, '0.0.0.0')
  })

  it('should timeout', done => {
    const TIMEOUT = 150
    const svr = initTestServer(PORT)
    const ss = socketStream('udp4')(TIMEOUT)

    ss.messages$.pipe(first()).subscribe(res => {
      expect(true).toEqual(false)
    }, (_err: Error) => {
      svr.close()
      expect(_err.message).toEqual(`Timed out after ${TIMEOUT} miliseconds`)
      done()
    })
  })
})