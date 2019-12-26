import { generateWsDiscoveryProbePayload } from './payload'
import { map } from 'rxjs/operators'
import { probe } from '../core/probe'
import { IWsProbeConfig, IWsResponse } from './ws-probe.interfaces'
import { DEFAULT_WS_PROBE_CONFIG } from './config'
import { IdService } from '../util/id.service'
import { UdpProbe } from '../core/probe.new'

const mapDeviceStrToPayload = (str: string) => generateWsDiscoveryProbePayload(new IdService().guid())(str)
const mapDevicesToPayloads = (devices: readonly string[]) => devices.map(mapDeviceStrToPayload)

export const wsProbe =
  (config?: Partial<IWsProbeConfig>): IWsResponse => {
    const cfg = { ...DEFAULT_WS_PROBE_CONFIG, ...config } as IWsProbeConfig
    return new UdpProbe(
      cfg.PROBE_REQUEST_SAMPLE_RATE_MS,
      cfg.PROBE_RESPONSE_TIMEOUT_MS,
      cfg.PROBE_RESPONSE_FALLOUT_MS,
      cfg.RESULT_DEDUPE_FN,
      cfg.MULTICAST_ADDRESS,
      cfg.SOCKET_PROTOCOL,
      cfg.PORTS)
      .start(mapDevicesToPayloads(cfg.DEVICES))
      .pipe(map(b => {
        console.log(b)
        return b.map(raw => {
          return {
            raw,
            doc: cfg.PARSER(raw)
          }
        })
      }))
  }

