import { wsProbe, IWsResponse } from '../ws-discovery/ws-probe'
import { ISocketStream } from '../core/socket-stream'
import { reader } from 'typescript-monads'
import { IProbeConfig } from '../config/config.probe'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { IOnvifDevice } from './device'
import { xmlToOnvifDevice } from './parse'

export interface IOnvifProbeResponse extends IWsResponse {
  readonly device: IOnvifDevice
}
export type IOnvifProbeResponses = readonly IOnvifProbeResponse[]

export const onvifProbe = (ss: ISocketStream) => 
  reader<IProbeConfig, Observable<IOnvifProbeResponses>>(cfg => 
    wsProbe(ss).map(res => res.pipe(map(a => a.map(b => {
      return {
        ...b,
        device: xmlToOnvifDevice(b.doc)()
      }
    })))).run(cfg))