import { createSocket } from 'dgram'
import { IProbeConfig } from '../config/config.probe'
import { initSocketStream } from '../core/probe'
import { DOMParser } from 'xmldom'
import { onvifProbe } from './onvif-probe'

const initTestServer = (port: number) => {
  const server = createSocket('udp4')
  server.on('error', _ => server.close())
  server.on('message', (msg, rinfo) => server.send(msg, 0, msg.length, rinfo.port, rinfo.address))
  server.bind(port)
  return server
}

describe('onvif-probe', () => {
  it.skip('should work', done => {
    // config
    const port = 41238
    const config: IProbeConfig = {
      ports: { upnp: [], wsDiscovery: [port] },
      address: '239.255.255.250',
      probeTimeoutMs: 10000,
      falloutMs: 1000,
      sampleIntervalMs: 5000,
      DOM_PARSER: new DOMParser()
    }

    initTestServer(port)
    initSocketStream.flatMap(onvifProbe).run(config)
      .subscribe(res => {
        console.log(res)
        // expect((res[0].match(/uuid:.*?</) as any)[0]).toEqual('uuid:NetworkVideoTransmitter<')
        done()
      })
  })
})