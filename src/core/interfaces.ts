import { SocketType } from 'dgram'

export type Strings = readonly string[]
export type Numbers = readonly number[]

export interface TimestampedMessage { readonly msg: string, readonly ts: number }
export type TimestampMessages = readonly TimestampedMessage[]
export type StringDictionary = { readonly [key: string]: string }

export interface IProbeConfig {
  readonly SOCKET_PROTOCOL: SocketType
  readonly PORTS: Numbers
  readonly MULTICAST_ADDRESS: string
  readonly PROBE_REQUEST_SAMPLE_RATE_MS: number
  readonly PROBE_RESPONSE_TIMEOUT_MS: number
  readonly PROBE_RESPONSE_FALLOUT_MS: number
  readonly RESULT_DEDUPE_FN: (msg: readonly TimestampedMessage[]) => StringDictionary
}
