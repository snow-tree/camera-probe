import { IProbeConfig, Strings } from '../core/interfaces'

export interface IWsResponse {
  readonly raw: string
  readonly doc: Document
}

export type IWsResponses = readonly IWsResponse[]


export interface IWsProbeConfig extends IProbeConfig {
  readonly DEVICES: Strings
  readonly PARSER: (str: string) => Document
}