export interface IONVIFDevice {
  readonly hardware: string
  readonly location: string
  readonly name: string
  readonly urn: string
  readonly metadataVersion: string
  readonly deviceServiceUri: string
  readonly ip: string
  readonly profiles: ReadonlyArray<string>
  readonly xaddrs: ReadonlyArray<string>
  // readonly types: ReadonlyArray<string>
  readonly scopes: ReadonlyArray<string>
}
