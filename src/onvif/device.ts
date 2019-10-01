import { Strings } from '../common/interfaces'

export interface IONVIFDevice {
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
