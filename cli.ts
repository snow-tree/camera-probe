import { writeFileSync, chmodSync } from 'fs'
import { resolve } from 'path'
import { ensureDirSync } from 'fs-extra'

const dir = resolve('dist')
const outPath = resolve(dir, 'onvif-probe')

ensureDirSync(dir)
writeFileSync(outPath, '#!/usr/bin/env node\nrequire(\'./onvif-probe-rx-cjs\').startProbingONVIFDevicesCli()')
chmodSync(outPath, '755')