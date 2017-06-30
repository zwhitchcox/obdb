const path = require('path')
const cp = require('child_process')
const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals')

const rimraf = require('rimraf')

const config = {
  entry: './test.server.js',
  devtool: 'source-map',
  target: 'node',
  output: {
    filename: 'dist/test.js',
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: 'require("source-map-support").install();',
      raw: true,
      entryOnly: false
    }),
    function()
      {
          this.plugin("done", function(stats)
          {
            const jsonStats = stats.toJson()
              if (stats.compilation.errors && stats.compilation.errors.length)
              {
                  console.log(require('utf8').encode(jsonStats.errors[0]));
                  process.exit(1);
              }
              // ...
          });
      },
  ],
  module: {
    rules: [
      {
        test: /.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
    ]
  },
  externals: [nodeExternals()]
}
const compiler = webpack(config)
let server
let pending = true
const serverPath = `${__dirname}/${config.output.filename}`
compiler.watch({}, runServer)


function runServer() {
  function onStdOut(data) {
    const time = new Date().toTimeString()
    const match = data.toString('utf8').match(/App is listening/)
    if (match) {
      server.host = match[1]
      pending = false
      return
    }
    process.stdout.write(data)
  }

  if (server) {
    server.kill('SIGTERM')
  }

  server = cp.spawn('node', [serverPath], {
    env: Object.assign({ NODE_ENV: 'development' }, process.env),
    silent: false,
  })

  if (pending) {
    server.once('exit', (code, signal) => {
      if (pending) {
        throw new Error(`Server terminated unexpectedly with code: ${code} signal: ${signal}`)
      }
    })
  }

  server.stdout.on('data', onStdOut)
  server.stderr.on('data', x => process.stderr.write(x))

  return server
}

process.on('exit', () => {
  if (server) {
    server.kill('SIGTERM')
  }
})

const Html = require('html-webpack-plugin')
const Fail = require('webpack-fail-plugin')
const sync = require('glob').sync
const webpackDevServer = require('webpack-dev-server')
const mochaConfig = {
  entry: './test.server.js',
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
  plugins: [
    new Html(),
    Fail,
    new webpack.BannerPlugin({
      banner: 'require("source-map-support").install();',
      raw: true,
      entryOnly: false,
      include: './src/{**/*,*}.spec.js'
    }),
  ],
}
mochaConfig.entry = sync('./src/{**/*,*}.spec.js')
mochaConfig.module.rules.push({
  test: /.spec.js$/,
  use: 'mocha-loader',
  exclude: /node_modules/
})
const mochaCompiler = webpack(mochaConfig)
const mochaServer = new webpackDevServer(mochaCompiler, {})
mochaServer.listen(8089)
