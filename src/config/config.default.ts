import { IProbeConfig } from './config.interface'
import { DOMParser } from 'xmldom'

export const DEFAULT_CONFIG: IProbeConfig = {
  DOM_PARSER: new DOMParser(),
  MULTICAST_ADDRESS: '239.255.255.250',
  FALLOUT_MS: 5000,
  PROBE_SAMPLE_TIME_MS: 0,
  PROBE_NETWORK_TIMEOUT_MS: 0,
  PORTS: {
    UPNP: [1900],
    WS_DISCOVERY: [3702]
  }
}