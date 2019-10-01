import { flattenBuffersWithInfo, probe, initSocketStream } from './probe'
import { createSocket } from 'dgram'
import { IProbeConfig } from '../config/config.probe'
import { first, skip, take } from 'rxjs/operators'
import { combineLatest } from 'rxjs'

const initTestServer = (port: number) => {
  const server = createSocket('udp4')
  server.on('error', _ => server.close())
  server.on('message', (msg, rinfo) => server.send(msg, 0, msg.length, rinfo.port, rinfo.address))
  server.bind(port)
  return server
}

describe('Probe', () => {
  it('should flatten buffers to ports', done => {
    const BUFFER_1 = Buffer.from('123')
    const BUFFER_2 = Buffer.from('456')
    const ADDRESS = '239.255.255.250'

    const bufferPorts = flattenBuffersWithInfo([1900, 2200])([BUFFER_1, BUFFER_2])(ADDRESS)

    expect(bufferPorts[0]).toEqual({ buffer: BUFFER_1, port: 1900, address: ADDRESS })
    expect(bufferPorts[1]).toEqual({ buffer: BUFFER_2, port: 1900, address: ADDRESS })
    expect(bufferPorts[2]).toEqual({ buffer: BUFFER_1, port: 2200, address: ADDRESS })
    expect(bufferPorts[3]).toEqual({ buffer: BUFFER_2, port: 2200, address: ADDRESS })
    done()
  })

  it('should probe basic, no distinct guard', done => {
    // config
    const port = 41231
    const config: IProbeConfig = {
      ports: [port],
      address: '0.0.0.0',
      protocol: 'udp4',
      probeTimeoutMs: 1000,
      falloutMs: 1000,
      onvifDeviceTypes: ['NetworkVideoTransmitter', 'Device', 'NetworkVideoDisplay']
    }

    initTestServer(port)
    const base = initSocketStream.flatMap(ss => probe(ss)).run(config)

    const val1 = base.pipe(first())
    const val2 = base.pipe(skip(1), take(1))
    const val3 = base.pipe(skip(2), take(1))

    combineLatest([val1, val2, val3]).subscribe(res => {
      expect(res.length).toEqual(3)
      done()
    })
  })

  it.only('should probe basic, distinct', done => {
    // config
    jest.setTimeout(7000)
    const port = 3702
    const distinctFilterFn = (prev: string, curr: string) => {
      const prevUrn = prev.match(/urn:uuid:.*?</g)
      const currUrn = curr.match(/urn:uuid:.*?</g)
      return ((prevUrn && prevUrn[1]) === (currUrn && currUrn[1]))
    }

    const config: IProbeConfig = {
      ports: [port],
      address: '239.255.255.250',
      protocol: 'udp4',
      // distinctFilterFn,
      probeTimeoutMs: 10000,
      falloutMs: 1000,
      onvifDeviceTypes: ['NetworkVideoTransmitter', 'Device', 'NetworkVideoDisplay']
    }

    initTestServer(port)
    initSocketStream.flatMap(ss => probe(ss)).run(config)
      .subscribe(res => {
        console.log(res)
        // expect((res[0].match(/uuid:.*?</) as any)[0]).toEqual('uuid:NetworkVideoTransmitter<')
        // done()
      })
  })
})