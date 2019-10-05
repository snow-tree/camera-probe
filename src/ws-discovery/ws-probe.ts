import { generateWsDiscoveryProbePayload } from './payload'
import { generateGuid } from '../core/guid'
import { TimestampMessages } from '../core/interfaces'
import { reader } from 'typescript-monads'
import { IProbeConfig } from '../config/config.interface'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { xmlToOnvifDevice } from '../onvif/parse'
import { probe } from '../core/probe'

export interface IWsResponse {
  readonly raw: string
  readonly doc: Document
}

export type IWsResponses = readonly IWsResponse[]

const mapDeviceStrToPayload = (str: string) => generateWsDiscoveryProbePayload(str)(generateGuid())
const mapDevicesToPayloads = (devices: readonly string[]) => devices.map(mapDeviceStrToPayload)
const wsDiscoveryParseToDict =
  (parser: DOMParser) =>
    (msg: TimestampMessages) =>
      msg.reduce((acc, curr) => {
        return {
          ...acc,
          [xmlToOnvifDevice(parser.parseFromString(curr.msg, 'application/xml'))().urn]: curr.msg
        }
      }, {})

export const wsProbe = reader<IProbeConfig, Observable<IWsResponses>>(cfg =>
  probe(cfg.PORTS.WS_DISCOVERY)(cfg.MULTICAST_ADDRESS)(mapDevicesToPayloads(cfg.ONVIF_DEVICES))(wsDiscoveryParseToDict(cfg.DOM_PARSER))
    .map(a => a.pipe(map(b => {
      return b.map(raw => {
        return {
          raw,
          doc: cfg.DOM_PARSER.parseFromString(raw)
        }
      })
    })))
    .run(cfg))
