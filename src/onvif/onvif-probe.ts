import { map } from 'rxjs/operators'
import { IOnvifDevice } from './device'
import { xmlToOnvifDevice } from './parse'
import { WsDiscoveryClient } from '../ws-discovery/ws-probe'
import { Observable } from 'rxjs'
import { IWsResponseModel, IWsProbeConfig } from '../ws-discovery/ws-probe.interfaces'

export interface IOnvifProbeResponseModel extends IWsResponseModel {
  readonly device: IOnvifDevice
}
export type IOnvifProbeResponseModels = readonly IOnvifProbeResponseModel[]
export type IOnvifProbeResponse = Observable<IOnvifProbeResponseModels>

export const onvifProbe =
  (config?: Partial<IWsProbeConfig>): IOnvifProbeResponse =>
    new WsDiscoveryClient(config)
      .probe()
      .pipe(map(res => res.map(a => {
        return {
          ...a,
          device: xmlToOnvifDevice(a.doc)()
        }
      })))
