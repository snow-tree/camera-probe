import { IProbeConfig } from './config.interface'
import { DOMParser } from 'xmldom'

export const DEFAULT_CONFIG: IProbeConfig = {
  DOM_PARSER: new DOMParser(),
  address: '',
  falloutMs: 0,
  probeTimeoutMs: 0,
  sampleIntervalMs: 0,
  ports: {
    upnp: [],
    wsDiscovery: []
  }
}