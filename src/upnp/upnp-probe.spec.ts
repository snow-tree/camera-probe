import { createSocket } from 'dgram'
import { IProbeConfig } from '../config/config.probe'
import { initSocketStream } from '../core/probe'
import { DOMParser } from 'xmldom'
import { upnpProbe } from './upnp-probe'

const initTestServer = (port: number) => {
  const server = createSocket('udp4')
  server.on('error', _ => server.close())
  server.on('message', (msg, rinfo) => server.send(msg, 0, msg.length, rinfo.port, rinfo.address))
  server.bind(port)
  return server
}

describe.skip('upnp probe', () => {
  it.skip('ddddd', done => {
    // config
    const port = 1900
    const config: IProbeConfig = {
      ports: { upnp: [port], wsDiscovery: [] },
      address: '0.0.0.0',
      probeTimeoutMs: 10000,
      falloutMs: 1000,
      sampleIntervalMs: 5000,
      DOM_PARSER: new DOMParser()
    }

    // initTestServer(port)
    initSocketStream.flatMap(upnpProbe).run(config)
      .subscribe(res => {
        console.log(res)
      })
  })
})