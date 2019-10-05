import { generateWsDiscoveryProbePayload } from './payload'
import { generateGuid } from '../core/guid'
import { map } from 'rxjs/operators'
import { probe } from '../core/probe'
import { IWsProbeConfig } from './ws-probe.interfaces'
import { DEFAULT_WS_PROBE_CONFIG } from './config'

const mapDeviceStrToPayload = (str: string) => generateWsDiscoveryProbePayload(str)(generateGuid())
const mapDevicesToPayloads = (devices: readonly string[]) => devices.map(mapDeviceStrToPayload)

export const wsProbe =
  (config?: Partial<IWsProbeConfig>) => {
    const cfg = { ...DEFAULT_WS_PROBE_CONFIG, ...config } as IWsProbeConfig
    return probe(cfg)(mapDevicesToPayloads(cfg.DEVICES))
      .pipe(map(b => {
        return b.map(raw => {
          return {
            raw,
            doc: cfg.PARSER(raw)
          }
        })
      }))
  }

