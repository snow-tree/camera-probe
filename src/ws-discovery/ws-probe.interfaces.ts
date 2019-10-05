import { IProbeConfig, Strings } from '../core/interfaces'
import { Observable } from 'rxjs'

export interface IWsResponseModel {
  readonly raw: string
  readonly doc: Document
}

export type IWsResponses = readonly IWsResponseModel[]
export type IWsResponse = Observable<IWsResponses>

export interface IWsProbeConfig extends IProbeConfig {
  readonly DEVICES: Strings
  readonly PARSER: (str: string) => Document
}