import { probe } from '../core/probe'
import { ISocketStream } from '../core/socket-stream'
import { generateWsDiscoveryProbePayload } from './payload'
import { generateGuid } from '../core/guid'
import { TimestampMessages, StringDictionary } from '../core/interfaces'
import { maybe, reader } from 'typescript-monads'
import { IProbeConfig } from '../config/config.probe'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export interface IWsResponse {
  readonly raw: string
  readonly doc: Document
}

export type IWsResponses = readonly IWsResponse[]

const mapDeviceStrToPayload = (str: string) => generateWsDiscoveryProbePayload(str)(generateGuid())
const mapDevicesToPayloads = (devices: readonly string[]) => devices.map(mapDeviceStrToPayload)
const wsDiscoveryParseToDict =
  (msg: TimestampMessages) =>
    msg.reduce((acc, item) =>
      maybe(item.msg.match(/urn:uuid:.*?</g))
        .flatMapAuto(a => a[0].replace('<', '').split(':').pop())
        .filter(key => !acc[key])
        .map(key => ({ ...acc, [key]: item.msg }))
        .valueOr(acc), {} as StringDictionary)

export const wsProbe = (ss: ISocketStream) => 
  reader<IProbeConfig, Observable<IWsResponses>>(cfg => 
    probe(ss)(cfg.ports.wsDiscovery)(cfg.address)(mapDevicesToPayloads(['NetworkVideoTransmitter', 'Device', 'NetworkVideoDisplay']))(wsDiscoveryParseToDict)
      .map(a => a.pipe(map(b => {
        return b.map(raw => {
          return {
            raw,
            doc: cfg.DOM_PARSER.parseFromString(raw)
          }
        })
      })))
      .run(cfg))
    
