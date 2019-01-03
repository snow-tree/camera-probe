import { DOMParser } from 'xmldom'

export interface IProbeConfig {
  readonly PORT: number
  readonly MULTICAST_ADDRESS: string
  readonly PROBE_SAMPLE_TIME_MS: number
  readonly PROBE_SAMPLE_START_DELAY_TIME_MS: number
  readonly PROBE_NETWORK_TIMEOUT_MS: number
  readonly ONVIF_DEVICES: ReadonlyArray<string>
  readonly DOM_PARSER: DOMParser
  readonly NOT_FOUND_STRING: string
}

export const DEFAULT_CONFIG: IProbeConfig = {
  PORT: 3702,
  MULTICAST_ADDRESS: '239.255.255.250',
  PROBE_SAMPLE_TIME_MS: 2000,
  PROBE_SAMPLE_START_DELAY_TIME_MS: 0,
  PROBE_NETWORK_TIMEOUT_MS: 2000 * 1.5,
  ONVIF_DEVICES: ['NetworkVideoTransmitter', 'Device', 'NetworkVideoDisplay'],
  DOM_PARSER: new DOMParser(),
  NOT_FOUND_STRING: 'unknown'
}
