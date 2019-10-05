// import { IProbeConfig } from './config.interface'
// import { DOMParser } from 'xmldom'

// export const DEFAULT_CONFIG: IProbeConfig = {
//   DOM_PARSER: new DOMParser(),
//   MULTICAST_ADDRESS: '239.255.255.250',
//   PROBE_SAMPLE_TIME_MS: 3000,
//   PROBE_NETWORK_TIMEOUT_MS: 6000,
//   FALLOUT_MS: 4000,
//   ONVIF_DEVICES: ['NetworkVideoTransmitter', 'Device', 'NetworkVideoDisplay'],
//   PORTS: {
//     UPNP: [1900],
//     WS_DISCOVERY: [3702]
//   }
// }

// export const DEFAULT_PROBE_CONFIG: IProbeConfig = {
//   MULTICAST_ADDRESS: '239.255.255.250',
//   PROBE_SAMPLE_TIME_MS: 3000,
//   PROBE_NETWORK_TIMEOUT_MS: 6000,
//   FALLOUT_MS: 4000
// }

import { DOMParser } from 'xmldom'
const dom = new DOMParser()
export const XML_PARSER_FN = (str: string) => dom.parseFromString(str, 'application/xml')