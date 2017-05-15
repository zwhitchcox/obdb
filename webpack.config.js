var webpack = require('webpack')
var path = require('path')
var Html = require('html-webpack-plugin')
var Fail = require('webpack-fail-plugin')
var sync = require('glob').sync

var config = module.exports = {
  entry: './index.js',
  devtool: 'source-map',
  output: {
    filename: 'dist/[name].js',
  },
  module: {
    rules: [
      //{
      //  test: /\.js$/,
      //  use: "source-map-loader",
      //  enforce: "pre"
      //},
      {
        test: /.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
    ]
  },
}

if (process.env.mode === 'test') {
  config.entry = sync('./src/{**/*,*}.spec.js')
  config.module.rules.push({
    test: /.spec.js$/,
    use: 'mocha-loader',
    exclude: /node_modules/
  })
  config.plugins = [new Html(), Fail]
}
