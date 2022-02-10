const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = () => [
  {
    entry: './src/index.ts',
    output: {
      path: path.resolve(__dirname, 'lib'),
      filename: 'index.js',
      library: {
        name: 'Copc',
        type: 'var',
      },
    },
    module: {
      rules: [
        {
          test: /\.ts?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          { from: './src/laz-perf/laz-perf.wasm', to: './laz-perf/' },
          { from: './src/laz-perf/laz-perf.js', to: './laz-perf/' },
        ],
      }),
    ],
    resolve: {
      extensions: ['.ts'],
      modules: [path.resolve('./src'), path.resolve('./node_modules')],
      fallback: {
	crypto: false,
	fs: false,
	path: false,
      }
    },
  },
]
