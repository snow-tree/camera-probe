import { wsProbe } from '../ws-discovery/ws-probe'
import { reader } from 'typescript-monads'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { IOnvifDevice } from './device'
import { xmlToOnvifDevice } from './parse'
import { IWsResponse, IWsProbeConfig } from '../ws-discovery/ws-probe.interfaces'

export interface IOnvifProbeResponse extends IWsResponse {
  readonly device: IOnvifDevice
}
export type IOnvifProbeResponses = readonly IOnvifProbeResponse[]

export const onvifProbe =
  (config?: Partial<IWsProbeConfig>) =>
    wsProbe(config)
      .pipe(map(res => res.map(a => {
        return {
          ...a,
          device: xmlToOnvifDevice(a.doc)()
        }
      })))
