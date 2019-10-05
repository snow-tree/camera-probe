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
  readonly RESULT_DEDUPE_FN: (msg: TimestampMessages) => StringDictionary
}

export const DEFAULT_PROBE_CONFIG: IProbeConfig = {
  PORTS: [],
  SOCKET_PROTOCOL: 'udp4',
  MULTICAST_ADDRESS: '239.255.255.250',
  PROBE_REQUEST_SAMPLE_RATE_MS: 3000,
  PROBE_RESPONSE_FALLOUT_MS: 4000,
  PROBE_RESPONSE_TIMEOUT_MS: 6000,
  RESULT_DEDUPE_FN: (msg: TimestampMessages) => {
    return msg.reduce((acc, curr) => {
      return { ...acc, curr }
    }, {})
  }
}
