import { DOMParser } from 'xmldom'
import { Numbers } from '../core/interfaces'

/**
 * Probe configuration
 */
export interface IProbeConfig {
  /**
   * An object the conforms to the W3C DOMParser spec. This helps parse respnse XML.
   */
  readonly DOM_PARSER: DOMParser

  readonly FALLOUT_MS: number
  
  readonly distinctFilterFn?: (prev: string, curr: string) => boolean
  readonly MULTICAST_ADDRESS: string
  readonly PORTS: {
    readonly UPNP: Numbers
    readonly WS_DISCOVERY: Numbers
  }

  /**
   * Time it takes to determine if a device is no longer present on the network.
   * This is best to be at least 1.5x longer than PROBE_SAMPLE_TIME_MS
   */

  /**
   * How frequent, in milliseconds, the network is scanned for devices.
   */
  readonly PROBE_SAMPLE_TIME_MS: number

  // /**
  //  * Delay, in miliseconds, before the first scan is sent.
  //  */
  // readonly PROBE_SAMPLE_START_DELAY_TIME_MS: number

  /**
   * Time it takes to determine if a device is no longer present on the network.
   * This is best to be at least 1.5x longer than PROBE_SAMPLE_TIME_MS
   */
  readonly PROBE_NETWORK_TIMEOUT_MS: number

  /**
   * ONVIF device types to check for.
   */
  readonly ONVIF_DEVICES: readonly string[]

  // /**
  //  * When an attribute is undefined, use this text instead.
  //  */
  // readonly NOT_FOUND_STRING: string
}



