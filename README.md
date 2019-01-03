# ONVIF Probe RX
Realtime Open Network Video Interface Forum (ONVIF) device discovery.

Continous monitoring of your home network ONVIF IP cameras.

## Installation
```sh
npm i onvif-probe-rx
```

## Usage
For the best developer experience use Typescript.

```ts
import { probeONVIFDevices } from 'onvif-probe-rx'

probeONVIFDevices()
  .run({})
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