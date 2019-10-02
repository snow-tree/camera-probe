import { onvifProbe } from './onvif/onvif-probe'
import { initSocketStream } from './core/probe'
import { DEFAULT_CONFIG } from './config/config.default'

export * from './config/config.interface'

export const start = () => initSocketStream.flatMap(onvifProbe).run(DEFAULT_CONFIG)

export const startCli = () => start()
  .subscribe(v => {
    console.log('\n')
    console.log('Scanning for networked cameras...')
    console.log(v)
  })

// interface IReponse {
//   devices: [
//     {
//       raw: 'string',
//       document: 'Maybe<Document>',
//       device,
//       scanType: 'discovery' | 'ipscan',
//       protocol: 'onvif' | 'upnp' | 'mdns'
//     }
//   ]
// }


// export { IONVIFDevice }
// export { DEFAULT_CONFIG }

// type ProbeStream = Observable<readonly IONVIFDevice[]>

// export const probeONVIFDevices = () => reader<Partial<IProbeConfig>, ProbeStream>(partialConfig => {
//   const config: IProbeConfig = { ...DEFAULT_CONFIG, ...partialConfig }

//   const ss = socketStream('udp4')(config.PROBE_NETWORK_TIMEOUT_MS)

//   const socketMessages = ss.messages$
//     .pipe(
//       // map(a => a),
//       distinctUntilChanged((a, b) => a.length === b.length && a !== b),
//       map(buf => buf.length ? maybe<string>(buf.toString()) : maybe<string>())
//     )

//   timer(config.PROBE_SAMPLE_START_DELAY_TIME_MS, config.PROBE_SAMPLE_TIME_MS)
//     .pipe(
//       take(ss.stop),
//       map(_ => config.ONVIF_DEVICES
//         .map(probePayload())
//         .map(xml => Buffer.from(xml, 'utf8'))
//       )
//     )
//     .subscribe(buffers => {
//       config.PORTS.forEach(port => {
//         buffers.forEach(b => ss.socket.send(b, 0, b.length, port, config.MULTICAST_ADDRESS))
//       })
//     })

//   const onvifScan = socketMessages
//     .pipe(
//       map(xmlResponse => xmlResponse
//         .map(xmlString => config.DOM_PARSER.parseFromString(xmlString, 'application/xml'))
//         .map(xmlDoc => parseXmlResponse(xmlDoc)(config))),
//       mergeScan<IMaybe<IONVIFDevice>, readonly IONVIFDevice[]>((acc, curr) => {
//         return forkJoin([...acc, curr.valueOrUndefined() as IONVIFDevice].filter(Boolean).map(device => ping(device.ip)()(config.PROBE_NETWORK_TIMEOUT_MS).pipe(
//           map(v => v.isOk()
//             ? { include: true, device }
//             : { include: false, device }))))
//           .pipe(
//             map(b => uniqueObjects([
//               ...acc.filter(a => b.filter(c => c.include === false).map(a => a.device.deviceServiceUri).some(c => c !== a.deviceServiceUri)),
//               ...b.filter(a => a.include).map(c => c.device)
//             ])))
//       }, []),
//       distinctUntilChanged((a, b) => MD5(a) === MD5(b)))

//   const ipScan = config.IP_SCANNER.ENABLED
//     ? timer(config.PROBE_SAMPLE_START_DELAY_TIME_MS, config.PROBE_SAMPLE_TIME_MS).pipe(flatMap(() => ipscan(config.IP_SCANNER.PREFIXES)(config.IP_SCANNER.IP_ADDRESSES)))
//     : of([])

//   return combineLatest(onvifScan, ipScan, (onvifResults, ipscanResults) => {
//     const ipDevicesNotInOnvifScan = ipscanResults.filter(a => !onvifResults.some(onv => onv.ip === maybeIpAddress(a).valueOrUndefined()))
//       .map<IONVIFDevice>(deviceServiceUri => {
//         return {
//           deviceServiceUri,
//           name: maybeIpAddress(deviceServiceUri).valueOr(config.NOT_FOUND_STRING),
//           hardware: config.NOT_FOUND_STRING,
//           location: config.NOT_FOUND_STRING,
//           ip: config.NOT_FOUND_STRING,
//           metadataVersion: config.NOT_FOUND_STRING,
//           urn: config.NOT_FOUND_STRING,
//           scopes: [],
//           profiles: [],
//           xaddrs: []
//         }
//       })
//     return [...onvifResults, ...ipDevicesNotInOnvifScan]
//   }).pipe(distinctUntilChanged((a, b) => MD5(a) === MD5(b)))
// })


