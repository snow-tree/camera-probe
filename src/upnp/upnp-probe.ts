import { ISocketStream } from '../core/socket-stream'
import { reader, maybe } from 'typescript-monads'
import { IProbeConfig } from '../config/config.interface'
import { Observable } from 'rxjs'
import { IWsResponses } from '../ws-discovery/ws-probe'
import { probe } from '../core/probe'
import { map } from 'rxjs/operators'
import { TimestampMessages } from '../core/interfaces'

// TODO!!!
const upnpDiscoveryParseToDict =
  (msg: TimestampMessages) =>
    msg.reduce((acc, item) => {
      const obj: any = item.msg.split('\r\n').filter(a => a !== '' && a !== '\r' && !a.match(/HTTP\//i)).reduce((acc, curr) => {
        const split = curr.split(':')
        const key = split[0]
        const val = split.slice(1).join(':').trim()
        return val ? {
          ...acc,
          [key]: val
        } : acc
      }, {})
      const z = maybe(obj['Location'])
        .match({
          none: () => acc,
          some: i => {
            return {
              ...acc,
              [i]: ''
            }
          }
        })
        return z
    }, {})

const query = 
`M-SEARCH * HTTP/1.1
HOST: 239.255.255.250:1900
MAN: ssdp:discover
MX: 10
ST: ssdp:all`

export const upnpProbe = (ss: ISocketStream) => 
  reader<IProbeConfig, Observable<IWsResponses>>(cfg => 
    probe(ss)(cfg.ports.upnp)('239.255.255.250')([query])(upnpDiscoveryParseToDict)
      .map(a => a.pipe(map(b => {
        return b.map(raw => {
          return {
            raw,
            doc: '' as any
          }
        })
      })))
      .run(cfg))
