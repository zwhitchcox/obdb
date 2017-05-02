var webpack = require('webpack')
var path = require('path')

module.exports = {
  entry: './index.ts',
  devtool: 'source-map',
  output: {
    filename: 'dist/[name].js',
  },
  module: {
    loaders: [
      {
        test: /.ts$/,
        loader: 'awesome-typescript-loader'
      }
    ]
  },
}

