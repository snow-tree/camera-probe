import { buildWsDiscoveryProbePayload } from './payload'
import { generateGuid } from '../core/guid'
import { map } from 'rxjs/operators'
import { probe } from '../core/probe'
import { IWsProbeConfig, IWsResponse } from './ws-probe.interfaces'
import { DEFAULT_WS_PROBE_CONFIG } from './config'

export class WsDiscoveryClient {
  constructor(private readonly config: Partial<IWsProbeConfig> = {}) { }

  private readonly probeConfig: IWsProbeConfig = { ...DEFAULT_WS_PROBE_CONFIG, ...this.config } as IWsProbeConfig

  static MapDeviceStrToPayload(type: string) {
    return buildWsDiscoveryProbePayload({ uuid: generateGuid(), type })
  }

  static MapDevicesToPayloads(devices: readonly string[]) {
    return devices.map(WsDiscoveryClient.MapDeviceStrToPayload)
  }

  probe() {
    return probe(this.probeConfig)(WsDiscoveryClient.MapDevicesToPayloads(this.probeConfig.DEVICES))
      .pipe(map(b => {
        return b.map(raw => {
          return {
            raw,
            doc: this.probeConfig.PARSER(raw)
          }
        })
      }))
  }
}

