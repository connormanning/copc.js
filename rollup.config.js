import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'

export default {
  input: 'src/index.ts',
  output: {
    file: 'lib/index.js',
    format: 'umd',
    name: 'Copc',
    globals: { fetch: 'fetch', fs: 'fs', path: 'path' },
  },
  external: ['cross-fetch', 'fetch', 'fs', 'path'],
  plugins: [
    nodeResolve(),
    commonjs({ include: /node_modules\/laz-perf/ }),
    json(),
    typescript({
      tsconfig: './tsconfig.production.json',
      // This will put the declarations at the top level of our output, which is
      // ./lib.  Otherwise it sticks them in ./lib/lib for some reason.
      declarationDir: '.',
    }),
  ],
}
