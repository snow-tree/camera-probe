import { generateWsDiscoveryProbePayload } from './payload'
import { generateGuid } from '../core/guid'
import { map } from 'rxjs/operators'
import { probe } from '../core/probe'
import { IWsProbeConfig, IWsResponse } from './ws-probe.interfaces'
import { DEFAULT_WS_PROBE_CONFIG } from './config'
import { Observable } from 'rxjs'

const mapDeviceStrToPayload = (str: string) => generateWsDiscoveryProbePayload(str)(generateGuid())
const mapDevicesToPayloads = (devices: readonly string[]) => devices.map(mapDeviceStrToPayload)

export const wsProbe =
  (config?: Partial<IWsProbeConfig>) => (until: Observable<any>): IWsResponse => {
    const cfg = { ...DEFAULT_WS_PROBE_CONFIG, ...config } as IWsProbeConfig
    return probe(cfg)(mapDevicesToPayloads(cfg.DEVICES))(until)
      .pipe(map(b => {
        return b.map(raw => {
          return {
            raw,
            doc: cfg.PARSER(raw)
          }
        })
      }))
  }

