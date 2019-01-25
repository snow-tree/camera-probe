<h1 align="center" style="border-bottom: none;">onvif-probe-rx</h1>
<h3 align="center">Continous monitoring of your home network ONVIF IP cameras.</h3>
<p align="center">
  <a href="https://circleci.com/gh/patrickmichalina/onvif-probe-rx">
    <img alt="circeci" src="https://circleci.com/gh/patrickmichalina/onvif-probe-rx.svg?style=shield">
  </a>
  <!-- <a href="https://codeclimate.com/github/patrickmichalina/onvif-probe-rx/test_coverage">
    <img src="https://api.codeclimate.com/v1/badges/f40c9fff2927e49c3ea2/test_coverage" />
  </a>
  <a href="https://codeclimate.com/github/patrickmichalina/onvif-probe-rx/maintainability">
    <img alt="codeclimate" src="https://api.codeclimate.com/v1/badges/f40c9fff2927e49c3ea2/maintainability">
  </a> -->
</p>
<p align="center">
  <a href="https://greenkeeper.io">
    <img alt="greenkeeper" src="https://badges.greenkeeper.io/semantic-release/semantic-release.svg">
  </a>
  <a href="https://david-dm.org/patrickmichalina/onvif-probe-rx">
    <img alt="greenkeeper" src="https://david-dm.org/patrickmichalina/onvif-probe-rx/status.svg">
  </a>
  <a href="https://david-dm.org/patrickmichalina/onvif-probe-rx?type=dev">
    <img alt="greenkeeper" src="https://david-dm.org/patrickmichalina/onvif-probe-rx/dev-status.svg">
  </a>
</p>
<p align="center">
  <a href="https://github.com/semantic-release/semantic-release">
    <img alt="semantic-release" src="https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg">
  </a>
  <a href="https://www.npmjs.com/package/onvif-probe-rx">
    <img alt="npm latest version" src="https://img.shields.io/npm/v/onvif-probe-rx/latest.svg">
  </a>
</p>


## Installation
This package is designed to be run in a Node environment. For the best developer experience use Typescript.
```sh
$ npm i onvif-probe-rx
```

## CLI
For CLI usage its easier to install globally like so:
```sh
$ npm i -g onvif-probe-rx

// starting listening
$ onvif-probe
```

## Usage
Starts probing the network using the default configuration.
```ts
import { startProbingONVIFDevices } from 'onvif-probe-rx'

startProbingONVIFDevices()
  .subscribe(console.info)
```

```js
// example probe results
// two cameras discovered on the network with ONVIF WS-Discovery via UDP
[ { name: 'Amcrest',
    hardware: 'IP2M-8200',
    location: 'china',
    deviceServiceUri: 'http://192.168.5.191/onvif/device_service',
    ip: '192.168.5.191',
    metadataVersion: '1',
    urn: 'fae40e7f-91e2-489a-afe6-66e19b667952',
    scopes:
     [ 'onvif://www.onvif.org/location/country/china',
       'onvif://www.onvif.org/name/Amcrest',
       'onvif://www.onvif.org/hardware/IP2M-8200',
       'onvif://www.onvif.org/Profile/Streaming',
       'onvif://www.onvif.org/type/Network_Video_Transmitter',
       'onvif://www.onvif.org/extension/unique_identifier',
       'onvif://www.onvif.org/Profile/G' ],
    profiles: [ 'Streaming', 'G' ],
    xaddrs: [ 'http://192.168.5.191/onvif/device_service' ] },
  { name: 'IPCAM',
    hardware: '421FZ',
    location: 'china',
    deviceServiceUri: 'http://192.168.5.13:80/onvif/device_service',
    ip: '192.168.5.13',
    metadataVersion: '1',
    urn: '0cbc0d5b-a7a1-47c7-bb60-85c878bb540e',
    scopes:
     [ 'onvif://www.onvif.org/Profile/Streaming',
       'onvif://www.onvif.org/Model/421FZ',
       'onvif://www.onvif.org/Name/IPCAM',
       'onvif://www.onvif.org/location/country/china' ],
    profiles: [ 'Streaming' ],
    xaddrs: [ 'http://192.168.5.13:80/onvif/device_service' ] } ]
```

If you'd like to tweak default settings feel free to override in the `.run()` method.

```ts
import { probeONVIFDevices } from 'onvif-probe-rx'

probeONVIFDevices()
  .run({
    PORT: 553,
    PROBE_NETWORK_TIMEOUT_MS: 20000
  })
  .subscribe(console.log)
```

## Default Configuration
```ts
const DEFAULT_CONFIG: IProbeConfig = {
  PORT: 3702,
  ENABLE_IP_SCANNING: true,
  MULTICAST_ADDRESS: '239.255.255.250',
  PROBE_SAMPLE_TIME_MS: 2000,
  PROBE_SAMPLE_START_DELAY_TIME_MS: 0,
  PROBE_NETWORK_TIMEOUT_MS: 2000 * 1.5,
  ONVIF_DEVICES: ['NetworkVideoTransmitter', 'Device', 'NetworkVideoDisplay'],
  DOM_PARSER: new DOMParser(),
  NOT_FOUND_STRING: 'unknown'
}
```
