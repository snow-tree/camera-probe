import { maybe } from 'typescript-monads'
import { TimestampMessages, IProbeConfig } from '../core/interfaces'
import { probe } from '../core/probe'

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

export const upnpProbe = (config: Partial<IProbeConfig>) => probe(config)([query])
