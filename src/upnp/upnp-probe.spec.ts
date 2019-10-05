import { createSocket } from 'dgram'
import { IProbeConfig } from '../config/config.interface'
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
    const port = 1900
    const config: IProbeConfig = {
      PORTS: { UPNP: [port], WS_DISCOVERY: [] },
      MULTICAST_ADDRESS: '0.0.0.0',
      FALLOUT_MS: 1000,
      PROBE_SAMPLE_TIME_MS: 5000,
      PROBE_NETWORK_TIMEOUT_MS: 10000,
      ONVIF_DEVICES: ['NetworkVideoTransmitter', 'Device', 'NetworkVideoDisplay'],
      DOM_PARSER: new DOMParser()
    }

    upnpProbe.run(config)
      .subscribe(res => {
        console.log(res)
      })
  })
})