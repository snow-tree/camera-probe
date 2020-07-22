export interface IBuildWSDiscoveryPayloadOpts {
  readonly uuid: string
  readonly type: string
}

export function buildWsDiscoveryProbePayload(config: IBuildWSDiscoveryPayloadOpts) {
  return `<?xml version="1.0" encoding="UTF-8"?>
  <Envelope xmlns="http://www.w3.org/2003/05/soap-envelope">
    <Header xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing">
      <a:Action mustUnderstand="1">http://schemas.xmlsoap.org/ws/2005/04/discovery/Probe</a:Action>
      <a:MessageID>uuid:${config.uuid}</a:MessageID>
      <a:ReplyTo>
        <a:Address>http://schemas.xmlsoap.org/ws/2004/08/addressing/role/anonymous</a:Address>
      </a:ReplyTo>
      <a:To mustUnderstand="1">urn:schemas-xmlsoap-org:ws:2005:04:discovery</a:To>
    </Header>
    <Body>
      <Probe xmlns="http://schemas.xmlsoap.org/ws/2005/04/discovery">
        <Types xmlns:dp0="http://www.onvif.org/ver10/network/wsdl">
          dp0:${config.type}
        </Types>
      </Probe>
    </Body>
  </Envelope>`
}