<h1 align="center" style="border-bottom: none;">camera-probe</h1>
<h3 align="center">Realtime Open Network Video Interface Forum (ONVIF) device discovery and camera detection.</h3>
<p align="center">
  <a href="https://circleci.com/gh/patrickmichalina/camera-probe">
    <img alt="circeci" src="https://circleci.com/gh/patrickmichalina/camera-probe.svg?style=shield">
  </a>
  <a href="https://codeclimate.com/github/patrickmichalina/camera-probe/test_coverage">
    <img src="https://api.codeclimate.com/v1/badges/f40c9fff2927e49c3ea2/test_coverage" />
  </a>
  <a href="https://codeclimate.com/github/patrickmichalina/camera-probe/maintainability">
    <img alt="codeclimate" src="https://api.codeclimate.com/v1/badges/f40c9fff2927e49c3ea2/maintainability">
  </a>
</p>
<p align="center">
  <a href="https://greenkeeper.io">
    <img alt="greenkeeper" src="https://badges.greenkeeper.io/semantic-release/semantic-release.svg">
  </a>
  <a href="https://david-dm.org/patrickmichalina/camera-probe">
    <img alt="greenkeeper" src="https://david-dm.org/patrickmichalina/camera-probe/status.svg">
  </a>
  <a href="https://david-dm.org/patrickmichalina/camera-probe?type=dev">
    <img alt="greenkeeper" src="https://david-dm.org/patrickmichalina/camera-probe/dev-status.svg">
  </a>
</p>
<p align="center">
  <a href="https://github.com/semantic-release/semantic-release">
    <img alt="semantic-release" src="https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg">
  </a>
  <a href="https://www.npmjs.com/package/camera-probe">
    <img alt="npm latest version" src="https://img.shields.io/npm/v/camera-probe/latest.svg">
  </a>
</p>

## Installation
This package is designed to be run in Node. For the best developer experience use Typescript.
```sh
$ npm i camera-probe
```

## CLI
For CLI usage its easier to install globally like so:
```sh
$ npm i -g camera-probe

// starting listening
$ onvif-probe
```

## Usage
Starts probing the network using the default configuration.
```ts
import { startProbingONVIFDevices } from 'camera-probe'

startProbingONVIFDevices()
  .subscribe(console.info)
```

```js
// example probe results
// two cameras discovered on the network with ONVIF WS-Discovery via UDP
// This will be the last emitted value in the observable until a new camera comes online
// or a camera is disconnected or otherwise fails to respond to a ping.

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
import { probeONVIFDevices } from 'camera-probe'

probeONVIFDevices()
  .run({
    PORTS: [3702],
    PROBE_NETWORK_TIMEOUT_MS: 20000
  })
  .subscribe(console.log)
```

## Default Configuration
```ts
export const DEFAULT_CONFIG: IProbeConfig = {
  PORTS: [139, 445, 1124, 3702],
  IP_SCANNER: {
    ENABLED: true,
    IP_ADDRESSES: [],
    PREFIXES: []
  },
  MULTICAST_ADDRESS: '239.255.255.250',
  PROBE_SAMPLE_TIME_MS: 2000,
  PROBE_SAMPLE_START_DELAY_TIME_MS: 0,
  PROBE_NETWORK_TIMEOUT_MS: 2000 * 1.5,
  ONVIF_DEVICES: ['NetworkVideoTransmitter', 'Device', 'NetworkVideoDisplay'],
  DOM_PARSER: new DOMParser(),
  NOT_FOUND_STRING: 'unknown'
}
```
