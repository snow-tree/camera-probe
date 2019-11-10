
import { map, shareReplay } from 'rxjs/operators'
import { onvifProbe } from './onvif/onvif-probe'

export * from './onvif/device'

export const onvifProbe$ = () => onvifProbe().pipe(shareReplay(1))
export const onvifDevices$ = () => onvifProbe$().pipe(map(a => a.map(b => b.device)))
export const onvifResponses$ = () => onvifProbe$().pipe(map(a => a.map(b => b.raw)))

export const cli = () => {
  return onvifDevices$()
    .subscribe(res => {
      console.clear()
      console.log('Camera Probe')
      console.table(
        res.map(device => {
          return {
            Name: device.name,
            Model: device.hardware,
            IP: device.ip,
            URN: device.urn,
            Endpoint: device.deviceServiceUri
          }
        }))
    })
}
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