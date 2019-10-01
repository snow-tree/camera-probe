import { Strings } from '../core/interfaces'

export interface IOnvifDevice {
  readonly hardware: string
  readonly location: string
  readonly name: string
  readonly urn: string
  readonly ip: string
  readonly metadataVersion: string
  readonly deviceServiceUri: string
  readonly profiles: Strings
  readonly xaddrs: Strings
  readonly scopes: Strings
}
