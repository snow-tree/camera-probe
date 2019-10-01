import { flatMap, map, catchError } from 'rxjs/operators'
import { ok, fail } from 'typescript-monads'
import { forkJoin, of } from 'rxjs'
import { ping } from 'ping-rx'
import { networkInterfaces, NetworkInterfaceInfo } from 'os'
import { RxHR as http } from '@akanass/rx-http-request'
import { Strings } from './core/interfaces'

export const createNumberedList = (num: number) => Array.from(Array(num).keys())
export const getIpRangeFromPrefix = (length = 256) => (prefix: string) => createNumberedList(length).map(a => `${prefix}.${a}`)

export const getIpPrefixListFromNetworkInterfaces = (family: 'IPv4' | 'IPv6' = 'IPv4') => {
  const interfaceDict = networkInterfaces()

  return Object.keys(interfaceDict)
    .reduce((acc: readonly NetworkInterfaceInfo[], curr) => [...acc, ...interfaceDict[curr]], [])
    .filter(a => a.family === family && !a.internal)
    .map(c => c.address.split('.').slice(0, 3).join('.'))
}

export const combined = (...args: readonly (Strings)[]) => args.reduce((acc, curr) => [...acc, ...curr], [])

export const ipscan =
  (ipAddressPrefixes: Strings = []) =>
    (ipAddresses: Strings = []) => {
      const standard = getIpPrefixListFromNetworkInterfaces().map(getIpRangeFromPrefix())
      const pref = ipAddressPrefixes.map(getIpRangeFromPrefix())
      // tslint:disable-next-line:readonly-array
      const toScan = combined(ipAddresses as string[], ...standard, ...pref)
      const pings = toScan.map(ip => ping(ip)()())

      return forkJoin(pings).pipe(
        map(res => res.filter(a => a.isOk()).map(a => `http://${a.unwrap().host}/onvif/device_service`)),
        flatMap(urls => forkJoin(
          urls.map(url => http.post(url, {
            headers: { 'Content-Type': 'application/soap+xml; charset=utf-8;' },
            body: '<Envelope xmlns="http://www.w3.org/2003/05/soap-envelope"><Body xmlns:xsd="http://www.w3.org/2001/XMLSchema"><GetSystemDateAndTime xmlns="http://www.onvif.org/ver10/device/wsdl"/></Body></Envelope>'
          }).pipe(
            map(res => res.response.statusCode === 200
              ? ok<string, string>(url)
              : fail<string, string>('')),
            catchError(err => of(fail(err)))
          ))
        )),
        map(hosts => hosts.filter(b => b.isOk()).map(z => z.unwrap())))
    }

