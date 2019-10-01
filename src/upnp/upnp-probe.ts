import { ISocketStream } from '../core/socket-stream'
import { reader, maybe } from 'typescript-monads'
import { IProbeConfig } from '../config/config.probe'
import { Observable } from 'rxjs'
import { IWsResponses } from '../ws-discovery/ws-probe'
import { probe } from '../core/probe'
import { map } from 'rxjs/operators'
import { TimestampMessages, StringDictionary } from '../core/interfaces'

// TODO
const upnpDiscoveryParseToDict =
  (msg: TimestampMessages) =>
    msg.reduce((acc, item) => {
      const d = item.msg.split('\r\n').filter(a => a !== '' && a !== '\r' && !a.match(/HTTP\//i)).reduce((acc, curr) => {
        const split = curr.split(':')
        const key = split[0]
        const val = split.slice(1).join(':').trim()
        return val ? {
          ...acc,
          [key]: val
        } : acc
      }, {})
      // console.log(d)
      return {
        ...acc,
        [1]: item.msg
      }
    }, {})
      // maybe(item.msg.match(/urn:uuid:.*?</g))
      //   .flatMapAuto(a => a[0].replace('<', '').split(':').pop())
      //   .filter(key => !acc[key])
      //   .map(key => ({ ...acc, [key]: item.msg }))
      //   .valueOr(acc), {} as StringDictionary)

const query = (port: number) => (address: string) => 
`M-SEARCH * HTTP/1.1
HOST: 239.255.255.250:1900
MAN: ssdp:discover
MX: 10
ST: ssdp:all`

export const upnpProbe = (ss: ISocketStream) => 
  reader<IProbeConfig, Observable<IWsResponses>>(cfg => 
    probe(ss)([query(1900)('239.255.255.250')])(upnpDiscoveryParseToDict)
      .map(a => a.pipe(map(b => {
        return b.map(raw => {
          return {
            raw,
            doc: cfg.DOM_PARSER.parseFromString(raw)
          }
        })
      })))
      .run(cfg))
