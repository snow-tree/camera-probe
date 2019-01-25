import { forkJoin, of } from 'rxjs'
import { ok, fail } from 'typescript-monads'
import { flatMap, map, catchError } from 'rxjs/operators'
import { RxHR as http } from '@akanass/rx-http-request'
import { ping } from 'ping-rx'

const createNumList = (num: number) => Array.from(Array(num).keys())

// TODO: base IP from os.networkinterfaces() `192.168.1.${num}

export const thing = () => forkJoin(createNumList(256).map(num => ping(`192.168.1.${num}`)(80)())).pipe(
  map(res => res.filter(a => a.isOk()).map(a => `http://${a.unwrap().host}/onvif/device_service`)),
  flatMap(urls => forkJoin(
    urls.map(url => http.post(url, {
      headers: { 'Content-Type': 'application/soap+xml; charset=utf-8;' },
      body: '<Envelope xmlns="http://www.w3.org/2003/05/soap-envelope"><Body xmlns:xsd="http://www.w3.org/2001/XMLSchema"><GetSystemDateAndTime xmlns="http://www.onvif.org/ver10/device/wsdl"/></Body></Envelope>'
    }).pipe(
      map(res => {
        return res.response.statusCode === 200
          ? ok<string, string>(url)
          : fail<string, string>('')
      }),
      catchError(err => of(fail(err)))
    ))
  )),
  map(hosts => hosts.filter(b => b.isOk()).map(z => z.unwrap()))
)

