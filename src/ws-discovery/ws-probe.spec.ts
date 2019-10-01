import { createSocket } from 'dgram'
import { IProbeConfig } from '../config/config.probe'
import { first, skip, take } from 'rxjs/operators'
import { combineLatest } from 'rxjs'
import { wsProbe } from './ws-probe'
import { initSocketStream } from '../core/probe'
import { DOMParser } from 'xmldom'

const initTestServer = (port: number) => {
  const server = createSocket('udp4')
  server.on('error', _ => server.close())
  server.on('message', (msg, rinfo) => server.send(msg, 0, msg.length, rinfo.port, rinfo.address))
  server.bind(port)
  return server
}

describe('ws probe', () => {
  it('should probe basic, no distinct guard', done => {
    // config
    const port = 41231
    const config: IProbeConfig = {
      probeTimeoutMs: 1000,
      falloutMs: 1000,
      sampleIntervalMs: 5000,
      DOM_PARSER: new DOMParser()
    }

    initTestServer(port)
    const base = initSocketStream.flatMap(wsProbe).run(config)
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
    const config: IProbeConfig = {
      probeTimeoutMs: 10000,
      falloutMs: 1000,
      sampleIntervalMs: 5000,
      DOM_PARSER: new DOMParser()
    }

    initTestServer(port)
    initSocketStream.flatMap(wsProbe).run(config)
      .subscribe(res => {
        console.log(res)
        // expect((res[0].match(/uuid:.*?</) as any)[0]).toEqual('uuid:NetworkVideoTransmitter<')
        done()
      })
  })
})