import { createSocket } from 'dgram'
import { IProbeConfig } from '../config/config.probe'
import { first, skip, take } from 'rxjs/operators'
import { combineLatest } from 'rxjs'
import { wsProbe } from './ws-probe'
import { initSocketStream } from '../core/probe'
import { DOMParser } from 'xmldom'

const wsXmlResponse = '<?xml version="1.0" encoding="UTF-8"?><SOAP-ENV:Envelope xmlns:SOAP-ENV="http://www.w3.org/2003/05/soap-envelope" xmlns:SOAP-ENC="http://www.w3.org/2003/05/soap-encoding" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:wsa="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:wsdd="http://schemas.xmlsoap.org/ws/2005/04/discovery" xmlns:vfdis="http://www.onvif.org/ver10/network/wsdl/RemoteDiscoveryBinding" xmlns:vfdis2="http://www.onvif.org/ver10/network/wsdl/DiscoveryLookupBinding" xmlns:tdn="http://www.onvif.org/ver10/network/wsdl"><SOAP-ENV:Header><wsa:MessageID>uuid:2709d68a-7dc1-61c2-a205-X3018101811662</wsa:MessageID><wsa:RelatesTo>uuid:NetworkVideoTransmitter</wsa:RelatesTo><wsa:ReplyTo SOAP-ENV:mustUnderstand="true"><wsa:Address>http://schemas.xmlsoap.org/ws/2004/08/addressing/role/anonymous</wsa:Address></wsa:ReplyTo><wsa:To SOAP-ENV:mustUnderstand="true">http://schemas.xmlsoap.org/ws/2004/08/addressing/role/anonymous</wsa:To><wsa:Action SOAP-ENV:mustUnderstand="true">http://schemas.xmlsoap.org/ws/2005/04/discovery/ProbeMatches</wsa:Action></SOAP-ENV:Header><SOAP-ENV:Body><wsdd:ProbeMatches><wsdd:ProbeMatch><wsa:EndpointReference><wsa:Address>urn:uuid:2419d68a-2dd2-21b2-a205-X2018101811779</wsa:Address><wsa:ReferenceProperties></wsa:ReferenceProperties><wsa:ReferenceParameters></wsa:ReferenceParameters><wsa:PortType>ttl</wsa:PortType></wsa:EndpointReference><wsdd:Types>tdn:4655721b-4e0e-4296-ba0b-3180423b5b0c</wsdd:Types><wsdd:Scopes>onvif://www.onvif.org/Profile/Streaming onvif://www.onvif.org/Model/631GA onvif://www.onvif.org/Name/IPCAM onvif://www.onvif.org/location/country/china</wsdd:Scopes><wsdd:XAddrs>http://192.168.1.1:80/onvif/device_service</wsdd:XAddrs><wsdd:MetadataVersion>1</wsdd:MetadataVersion></wsdd:ProbeMatch></wsdd:ProbeMatches></SOAP-ENV:Body></SOAP-ENV:Envelope>'

const initTestServer = (port: number) => {
  const server = createSocket('udp4')
  server.on('error', _ => server.close())
  server.on('message', (msg, rinfo) => {
    const buf = Buffer.from(wsXmlResponse)
    server.send(buf, 0, buf.length, rinfo.port, rinfo.address)
  })
  server.bind(port)
  return server
}

describe('ws probe', () => {
  it('should probe basic, no distinct guard', done => {
    const port = 41231
    const config: IProbeConfig = {
      ports: { upnp: [], wsDiscovery: [port] },
      address: '0.0.0.0',
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
    const port = 41231
    const config: IProbeConfig = {
      ports: { upnp: [], wsDiscovery: [port] },
      address: '0.0.0.0', //'239.255.255.250',
      probeTimeoutMs: 1000,
      falloutMs: 100,
      sampleIntervalMs: 100,
      DOM_PARSER: new DOMParser()
    }

    initTestServer(port)
    initSocketStream.flatMap(wsProbe).run(config)
      .subscribe(res => {
        const res1 = res[0]
        expect(res.length).toEqual(1)
        expect(res1).toBeDefined()
        expect(res1.doc).toBeDefined()
        done()
      })
  })
})