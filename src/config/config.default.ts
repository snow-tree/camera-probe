import { IProbeConfig } from './config.interface'
import { DOMParser } from 'xmldom'

export const DEFAULT_CONFIG: IProbeConfig = {
  DOM_PARSER: new DOMParser(),
  MULTICAST_ADDRESS: '239.255.255.250',
  PROBE_SAMPLE_TIME_MS: 6000,
  PROBE_NETWORK_TIMEOUT_MS: 12000,
  FALLOUT_MS: 24000,
  ONVIF_DEVICES: ['NetworkVideoTransmitter', 'Device', 'NetworkVideoDisplay'],
  PORTS: {
    UPNP: [1900],
    WS_DISCOVERY: [3702]
  }
}