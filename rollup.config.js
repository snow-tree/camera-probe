import typescript from 'rollup-plugin-typescript2'
import commonjs from 'rollup-plugin-commonjs'
import pkg from './package.json'

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
    },
    {
      file: pkg.module,
      format: 'es',
    }
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    'rxjs/operators',
    'dgram'
  ],
  plugins: [
    commonjs(),
    typescript({
      tsconfig: './tsconfig.rollup.json'
    })
  ]
}

