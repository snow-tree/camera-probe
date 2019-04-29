import { DOMParser } from 'xmldom'

export interface IIPScannerConfig {
  /**
   * Enable IP Scanning
   */
  readonly ENABLED: boolean

  /**
   * List of ip prefixes to scan (3 digits)
   * This will be in addition to the defailt gateway devices
   * found on the local machine. Each prefix will generate
   * 255 addresses to scan (0...255)
   * ex: ['10.211.55', '44.55.11']
   */
  readonly PREFIXES: readonly string[]

  /**
   * List of ip address to scan
   * This will be in addition to the defailt gateway devices
   * found on the local machine
   * ex: ['10.211.55.10', '44.55.11.15']
   */
  readonly IP_ADDRESSES: readonly string[]
}

/**
 * Probe configuration
 */
export interface IProbeConfig {
  /**
   * Ports to broadcast to.
   */
  readonly PORTS: readonly number[]

  /**
   * IP based scanning
   */
  readonly IP_SCANNER: Partial<IIPScannerConfig>

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
  readonly ONVIF_DEVICES: readonly string[]

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
  IP_SCANNER: {
    ENABLED: true,
    IP_ADDRESSES: [],
    PREFIXES: []
  },
  MULTICAST_ADDRESS: '239.255.255.250',
  PROBE_SAMPLE_TIME_MS: 2000,
  PROBE_SAMPLE_START_DELAY_TIME_MS: 0,
  PROBE_NETWORK_TIMEOUT_MS: 2000 * 1.5,
  ONVIF_DEVICES: ['NetworkVideoTransmitter', 'Device', 'NetworkVideoDisplay'],
  DOM_PARSER: new DOMParser(),
  NOT_FOUND_STRING: 'unknown'
}
