import { DOMParser } from 'xmldom'

/**
 * Probe configuration
 */
export interface IProbeConfig {
  /**
   * Ports to broadcast to.
   */
  readonly PORTS: ReadonlyArray<number>

  /**
   * Enabled IP based scanning
   */
  readonly ENABLE_IP_SCANNING: boolean

  /**
   * Multicast address.
   */
  readonly MULTICAST_ADDRESS: string

  /**
   * How frequent, in milliseconds, the network is scanned for devices.
   */
  readonly PROBE_SAMPLE_TIME_MS: number

  /**
   * Delay, in miliseconds, before the first scan is sent.
   */
  readonly PROBE_SAMPLE_START_DELAY_TIME_MS: number

  /**
   * Time it takes to determine if a device is no longer present on the network.
   * This is best to be at least 1.5x longer than PROBE_SAMPLE_TIME_MS
   */
  readonly PROBE_NETWORK_TIMEOUT_MS: number

  /**
   * ONVIF device types to check for.
   */
  readonly ONVIF_DEVICES: ReadonlyArray<string>

  /**
   * An object the conforms to the W3C DOMParser spec. This helps parse respnse XML.
   */
  readonly DOM_PARSER: DOMParser
  
  /**
   * When an attribute is undefined, use this text instead.
   */
  readonly NOT_FOUND_STRING: string
}

export const DEFAULT_CONFIG: IProbeConfig = {
  PORTS: [139, 445, 1124, 3702],
  ENABLE_IP_SCANNING: true,
  MULTICAST_ADDRESS: '239.255.255.250',
  PROBE_SAMPLE_TIME_MS: 2000,
  PROBE_SAMPLE_START_DELAY_TIME_MS: 0,
  PROBE_NETWORK_TIMEOUT_MS: 2000 * 1.5,
  ONVIF_DEVICES: ['NetworkVideoTransmitter', 'Device', 'NetworkVideoDisplay'],
  DOM_PARSER: new DOMParser(),
  NOT_FOUND_STRING: 'unknown'
}
