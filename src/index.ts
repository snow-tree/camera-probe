import { onvifProbe } from './onvif/onvif-probe'
import { initSocketStream } from './core/probe'
import { DEFAULT_CONFIG } from './config/config.default'

export * from './config/config.interface'

export const probe = initSocketStream.flatMap(onvifProbe)
export const devices$ = () => probe.run(DEFAULT_CONFIG)

export const startCli$ = () => devices$()
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