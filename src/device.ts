export interface IONVIFDevice {
  readonly hardware: string
  readonly location: string
  readonly name: string
  readonly urn: string
  readonly metadataVersion: string
  readonly deviceServiceUri: string
  readonly ip: string
  readonly profiles: readonly string[]
  readonly xaddrs: readonly string[]
  readonly scopes: readonly string[]
}
