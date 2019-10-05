import { createSocket } from 'dgram'
import { DOMParser } from 'xmldom'
import { onvifProbe } from './onvif-probe'

const ipcam = '<?xml version="1.0" encoding="UTF-8"?><SOAP-ENV:Envelope xmlns:SOAP-ENV="http://www.w3.org/2003/05/soap-envelope" xmlns:SOAP-ENC="http://www.w3.org/2003/05/soap-encoding" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:wsa="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:wsdd="http://schemas.xmlsoap.org/ws/2005/04/discovery" xmlns:vfdis="http://www.onvif.org/ver10/network/wsdl/RemoteDiscoveryBinding" xmlns:vfdis2="http://www.onvif.org/ver10/network/wsdl/DiscoveryLookupBinding" xmlns:tdn="http://www.onvif.org/ver10/network/wsdl"><SOAP-ENV:Header><wsa:MessageID>uuid:8eceb0ca-564e-4436-bec5-e63ea243c529</wsa:MessageID><wsa:RelatesTo>uuid:NetworkVideoTransmitter</wsa:RelatesTo><wsa:ReplyTo SOAP-ENV:mustUnderstand="true"><wsa:Address>http://schemas.xmlsoap.org/ws/2004/08/addressing/role/anonymous</wsa:Address></wsa:ReplyTo><wsa:To SOAP-ENV:mustUnderstand="true">http://schemas.xmlsoap.org/ws/2004/08/addressing/role/anonymous</wsa:To><wsa:Action SOAP-ENV:mustUnderstand="true">http://schemas.xmlsoap.org/ws/2005/04/discovery/ProbeMatches</wsa:Action></SOAP-ENV:Header><SOAP-ENV:Body><wsdd:ProbeMatches><wsdd:ProbeMatch><wsa:EndpointReference><wsa:Address>urn:uuid:8eceb0ca-564e-4436-bec5-e63ea243c529</wsa:Address><wsa:ReferenceProperties></wsa:ReferenceProperties><wsa:ReferenceParameters></wsa:ReferenceParameters><wsa:PortType>ttl</wsa:PortType></wsa:EndpointReference><wsdd:Types>tdn:4655721b-4e0e-4296-ba0b-3180423b5b0c</wsdd:Types><wsdd:Scopes>onvif://www.onvif.org/Profile/Streaming onvif://www.onvif.org/Model/631GA onvif://www.onvif.org/Name/IPCAM onvif://www.onvif.org/location/country/china</wsdd:Scopes><wsdd:XAddrs>http://192.168.1.1:80/onvif/device_service</wsdd:XAddrs><wsdd:MetadataVersion>1</wsdd:MetadataVersion></wsdd:ProbeMatch></wsdd:ProbeMatches></SOAP-ENV:Body></SOAP-ENV:Envelope>'
const amcrest = '<?xml version="1.0" encoding="utf-8" standalone="yes" ?><s:Envelope xmlns:sc="http://www.w3.org/2003/05/soap-encoding" xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:dn="http://www.onvif.org/ver10/network/wsdl" xmlns:tds="http://www.onvif.org/ver10/device/wsdl" xmlns:d="http://schemas.xmlsoap.org/ws/2005/04/discovery" xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing"><s:Header><a:MessageID>uuid:8eceb0ca-564e-4436-bec5-e63ea243c529</a:MessageID><a:To>urn:schemas-xmlsoap-org:ws:2005:04:discovery</a:To><a:Action>http://schemas.xmlsoap.org/ws/2005/04/discovery/ProbeMatches</a:Action><a:RelatesTo>uuid:Device</a:RelatesTo></s:Header><s:Body><d:ProbeMatches><d:ProbeMatch><a:EndpointReference><a:Address>uuid:8eceb0ca-564e-4436-bec5-e63ea243c529</a:Address></a:EndpointReference><d:Types>dn:NetworkVideoTransmitter tds:Device</d:Types><d:Scopes>onvif://www.onvif.org/location/country/china onvif://www.onvif.org/name/Amcrest onvif://www.onvif.org/hardware/IP2M-841B onvif://www.onvif.org/Profile/Streaming onvif://www.onvif.org/type/Network_Video_Transmitter onvif://www.onvif.org/extension/unique_identifier</d:Scopes><d:XAddrs>http://192.168.1.235/onvif/device_service</d:XAddrs><d:MetadataVersion>1</d:MetadataVersion></d:ProbeMatch></d:ProbeMatches></s:Body></s:Envelope>'

const initTestServer = (port: number) => (toSend: string) => {
  const server = createSocket('udp4')
  server.on('error', _ => server.close())
  server.on('message', (msg, rinfo) => {
    const buf = Buffer.from(toSend)
    server.send(buf, 0, buf.length, rinfo.port, rinfo.address)
  })
  server.bind(port)
  return server
}

const config = (port: number) => {
  return {
    PORTS: { UPNP: [], WS_DISCOVERY: [port] },
    MULTICAST_ADDRESS: '0.0.0.0',
    FALLOUT_MS: 12000,
    PROBE_SAMPLE_TIME_MS: 6000,
    PROBE_NETWORK_TIMEOUT_MS: 12000,
    ONVIF_DEVICES: ['NetworkVideoTransmitter', 'Device', 'NetworkVideoDisplay'],
    DOM_PARSER: new DOMParser()
  }
}

describe('onvif-probe', () => {
  it('should handle IPCAM - 631GA', done => {
    // jest.setTimeout(10000000)
    const port = 41241

    initTestServer(port)(ipcam)
    onvifProbe.run(config(port))
      .subscribe(res => {
        expect(res[0].device).toEqual({
          name: 'IPCAM',
          hardware: '631GA',
          location: 'china',
          deviceServiceUri: 'http://192.168.1.1:80/onvif/device_service',
          ip: '192.168.1.1',
          metadataVersion: '1',
          urn: '8eceb0ca-564e-4436-bec5-e63ea243c529',
          scopes: [
            'onvif://www.onvif.org/Profile/Streaming',
            'onvif://www.onvif.org/Model/631GA',
            'onvif://www.onvif.org/Name/IPCAM',
            'onvif://www.onvif.org/location/country/china'
          ],
          profiles: ['Streaming'],
          xaddrs: ['http://192.168.1.1:80/onvif/device_service']
        })
        done()
      })
  })

  it('should handle AMCREST - IP2M-841B', done => {
    const port = 41242

    initTestServer(port)(amcrest)
    onvifProbe.run(config(port))
      .subscribe(res => {
        expect(res[0].device).toEqual({
          name: 'Amcrest',
          hardware: 'IP2M-841B',
          location: 'china',
          deviceServiceUri: 'http://192.168.1.235/onvif/device_service',
          ip: '192.168.1.235',
          metadataVersion: '1',
          urn: '8eceb0ca-564e-4436-bec5-e63ea243c529',
          scopes: [
            'onvif://www.onvif.org/location/country/china',
            'onvif://www.onvif.org/name/Amcrest',
            'onvif://www.onvif.org/hardware/IP2M-841B',
            'onvif://www.onvif.org/Profile/Streaming',
            'onvif://www.onvif.org/type/Network_Video_Transmitter',
            'onvif://www.onvif.org/extension/unique_identifier'],
          profiles: ['Streaming'],
          xaddrs: ['http://192.168.1.235/onvif/device_service']
        })
        done()
      })
  })
})