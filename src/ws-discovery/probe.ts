import { socketStream } from '../core/socket-stream'
import { generateWsDiscoveryProbePayload } from './payload'
import { generateGuid } from '../core/guid'

// export const DEFAULT_CONFIG: IProbeConfig = {
//   PORTS: [139, 445, 1124, 3702],
//   IP_SCANNER: {
//     ENABLED: true,
//     IP_ADDRESSES: [],
//     PREFIXES: []
//   },
//   MULTICAST_ADDRESS: '239.255.255.250',
//   PROBE_SAMPLE_TIME_MS: 2000,
//   PROBE_SAMPLE_START_DELAY_TIME_MS: 0,
//   PROBE_NETWORK_TIMEOUT_MS: 2000 * 1.5,
//   ONVIF_DEVICES: ['NetworkVideoTransmitter', 'Device', 'NetworkVideoDisplay'],
//   DOM_PARSER: new DOMParser(),
//   NOT_FOUND_STRING: 'unknown'
// }

interface BufferPort {
  readonly buffer: Buffer
  readonly port: number
  readonly address: string
}

const mapStrXmlToBuffer = (str: string) => Buffer.from(str, 'utf8')
const mapDeviceStrToPayload = (str: string) => generateWsDiscoveryProbePayload(str)(generateGuid())
const xmlBuffers = ['NetworkVideoTransmitter', 'Device', 'NetworkVideoDisplay']
  .map(mapDeviceStrToPayload)
  .map(mapStrXmlToBuffer)

export const flattenBuffersToPorts =
  (ports: readonly number[]) =>
    (buffers: readonly Buffer[]) => ports.reduce((acc, port) =>
      [...acc, ...buffers.map(buffer => ({ buffer, port, address: '239.255.255.250' }))], [] as readonly BufferPort[])

export const exec = () => {
  const ss = socketStream('udp4')(25000)
  ss.messages$.subscribe(d => {
    console.log(d.unwrap().toString())
  })
  // return xmlBuffers
  flattenBuffersToPorts([3702])(xmlBuffers).forEach(mdl => ss.socket.send(mdl.buffer, 0, mdl.buffer.length, mdl.port, mdl.address))
}


// timer(0, 2000)
//   .pipe(
//     takeUntil(ss.close$),
//     map(_ => ['']
//       .map(generateWsDiscoveryProbePayload(''))
//       .map(xml => Buffer.from(xml, 'utf8'))
//     )
//   )
//   .subscribe(buffers => {
//     [1900].forEach(port => {
//       buffers.forEach(b => ss.socket.send(b, 0, b.length, port, ''))
//     })
//   })