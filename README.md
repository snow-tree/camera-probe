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
This package is designed to be run in a Node environment.
```sh
npm i onvif-probe-rx
```

## Usage
For the best developer experience use Typescript.

```ts
import { startProbingONVIFDevices } from 'onvif-probe-rx'

// starts probing the network using the default configuration
startProbingONVIFDevices()
  .subscribe(console.info)
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
  MULTICAST_ADDRESS: '239.255.255.250',
  PROBE_SAMPLE_TIME_MS: 2000,
  PROBE_SAMPLE_START_DELAY_TIME_MS: 0,
  PROBE_NETWORK_TIMEOUT_MS: 2000 * 1.5,
  ONVIF_DEVICES: ['NetworkVideoTransmitter', 'Device', 'NetworkVideoDisplay'],
  DOM_PARSER: new DOMParser(),
  NOT_FOUND_STRING: 'unknown'
}
```