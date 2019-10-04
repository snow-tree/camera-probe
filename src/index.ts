import { onvifProbe } from './onvif/onvif-probe'
import { initSocketStream } from './core/probe'
import { DEFAULT_CONFIG } from './config/config.default'
import { map, shareReplay } from 'rxjs/operators'

export * from './config/config.interface'

export const probe = initSocketStream.flatMap(onvifProbe)
export const probe$ = probe.run(DEFAULT_CONFIG).pipe(shareReplay(1))
export const devices$ = probe$.pipe(map(a => a.map(b => b.device)))
export const responses$ = probe$.pipe(map(a => a.map(b => b.raw)))

export const cli = () => {
  return devices$
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
            Endpoiint: device.deviceServiceUri
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