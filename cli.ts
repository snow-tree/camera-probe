import { writeFileSync, chmodSync, existsSync, mkdirSync } from 'fs'
import { resolve } from 'path'

const dir = resolve('dist')
const outPath = resolve(dir, 'camera-probe')

// tslint:disable-next-line: no-if-statement
if (!existsSync(dir)){
  mkdirSync(dir)
}

writeFileSync(outPath, '#!/usr/bin/env node\nrequire(\'../\').startCli()')
chmodSync(outPath, '755')