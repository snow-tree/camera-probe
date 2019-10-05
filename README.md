<h1 align="center" style="border-bottom: none;">camera-probe</h1>
<h3 align="center">Realtime scanning and discovery of networked cameras.</h3>
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

## CLI Usage
For CLI usage its easier to install globally like so:
```sh
$ npm i -g camera-probe

// starting listening
$ camera-probe

// This table will update as cameras come online and offline.
┌─────────┬───────────┬─────────────┬─────────────────┬──────────────────────────────────────────┬────────────────────────────────────────────────┐
│ (index) │   Name    │    Model    │       IP        │                   URN                    │                   Endpoint                     │
├─────────┼───────────┼─────────────┼─────────────────┼──────────────────────────────────────────┼────────────────────────────────────────────────┤
│    0    │ 'Amcrest' │ 'IP2M-841B' │ '192.168.1.1'   │  '38b4eeff-f5bd-46b9-92e4-30e6acffee73'  │  'http://192.168.1.1/onvif/device_service'     │
│    1    │  'IPCAM'  │   '631GA'   │ '192.168.1.2'   │  '4f5dcb4f-eea6-4cda-b290-f2b2b7d2f14f'  │  'http://192.168.1.2:80/onvif/device_service'  │
└─────────┴───────────┴─────────────┴─────────────────┴──────────────────────────────────────────┴────────────────────────────────────────────────┘
```

## Programmatic Usage
```js
import { onvifDevices$ } from 'camera-probe'

onvifDevices$.subscribe(console.log)

// results
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
