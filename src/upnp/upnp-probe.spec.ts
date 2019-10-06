import { createSocket } from 'dgram'
import { upnpProbe } from './upnp-probe'
import { Subject } from 'rxjs'

const initTestServer = (port: number) => {
  const server = createSocket('udp4')
  server.on('error', _ => server.close())
  server.on('message', (msg, rinfo) => server.send(msg, 0, msg.length, rinfo.port, rinfo.address))
  server.bind(port)
  return server
}

describe.skip('upnp probe', () => {
  it.skip('ddddd', done => {
    const port = 1900
    const end = new Subject()

    upnpProbe({ PORTS: [port] })(end)
      .subscribe(res => {
        console.log(res)
      })
  })
})