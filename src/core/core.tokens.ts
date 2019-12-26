import { InjectionToken } from 'injection-js'
import { SocketType } from 'dgram'
import { StringDictionary, TimestampMessages } from './interfaces'

export const PROBE_PORTS = new InjectionToken<readonly number[]>('probe.ports')
export const PROBE_SOCKET_PROTOCOL = new InjectionToken<SocketType>('probe.socket.protocol')
export const PROBE_MULTICAST_ADDRESS = new InjectionToken<string>('probe.multicast.address')
export const PROBE_REQUEST_SAMPLE_RATE_MS = new InjectionToken<number>('probe.req.sample.rate')
export const PROBE_RESPONSE_TIMEOUT_MS = new InjectionToken<number>('probe.res.timeout')
export const PROBE_RESPONSE_FALLOUT_MS = new InjectionToken<number>('probe.res.fallout')
export const PROBE_RESULT_DEDUPE_FN = new InjectionToken<(msg: TimestampMessages) => StringDictionary>('probe.dedupe')