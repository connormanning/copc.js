const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = () => [{
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: 'web/copc.js',
    library: 'COPC',
    libraryTarget: 'var'
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ]
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: "./src/laz-perf",
          to: "./web/laz-perf",
        }
      ]
    })
  ],
  resolve: {
    extensions: [".ts"],
    fallback: {
      "path": require.resolve("path-browserify"),
      "fs": false
    }
  },
}];
