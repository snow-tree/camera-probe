import { DOMParser } from 'xmldom'

/**
 * App configuration
 */
export interface IAppConfig {
  /**
   * An object the conforms to the W3C DOMParser spec. Used for parsing XML responses.
   */
  readonly DOM_PARSER: DOMParser
}
