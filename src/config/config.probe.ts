import { DOMParser } from 'xmldom'
import { TimestampMessages, StringDictionary, Numbers } from '../core/interfaces'

/**
 * Probe configuration
 */
export interface IProbeConfig {
  /**
   * Time it takes to determine if a device is no longer present on the network.
   * This is best to be at least 1.5x longer than PROBE_SAMPLE_TIME_MS
   */
  readonly probeTimeoutMs: number
  readonly falloutMs: number
  readonly sampleIntervalMs: number
  readonly distinctFilterFn?: (prev: string, curr: string) => boolean

  readonly address: string
  readonly ports: {
    readonly upnp: Numbers
    readonly wsDiscovery: Numbers
  }

  // /**
  //  * How frequent, in milliseconds, the network is scanned for devices.
  //  */
  // readonly PROBE_SAMPLE_TIME_MS: number

  // /**
  //  * Delay, in miliseconds, before the first scan is sent.
  //  */
  // readonly PROBE_SAMPLE_START_DELAY_TIME_MS: number

  // /**
  //  * Time it takes to determine if a device is no longer present on the network.
  //  * This is best to be at least 1.5x longer than PROBE_SAMPLE_TIME_MS
  //  */
  // readonly PROBE_NETWORK_TIMEOUT_MS: number

  // /**
  //  * ONVIF device types to check for.
  //  */
  // readonly ONVIF_DEVICES: readonly string[]

  // /**
  //  * When an attribute is undefined, use this text instead.
  //  */
  // readonly NOT_FOUND_STRING: string

  /**
   * An object the conforms to the W3C DOMParser spec. This helps parse respnse XML.
   */
  readonly DOM_PARSER: DOMParser
}



