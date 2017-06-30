var webpack = require('webpack')

var config = module.exports = {
  entry: './test.server.js',
  devtool: 'source-map',
  output: {
    filename: 'dist/[name].js',
  },
  module: {
    rules: [
      {
        test: /.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
    ]
  },
}

