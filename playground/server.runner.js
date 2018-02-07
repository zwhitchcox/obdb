const gaze = require('gaze')
const cp = require('child_process')
const path = require('path')
const express = require('express')
const WebSocket = require('ws')
const app = express()
const wss = new WebSocket.Server({port: 3002})
wss.on('connection', ws => {
  ws.on('error', console.error)
})
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

let server;
gaze(__dirname + '/build/server.js', (err, watcher) => {
  runserver()
  watcher.on('all', runserver)
})
function runserver() {
  if(server) {
    ready = 'false'
    console.log('restarting')
    server.kill('SIGTERM')
  }
  server = cp.spawn('node', [__dirname + '/build/server'])
  server.stdout.on('data', data => {
    if (/is listening/.test(data.toString())) {
      ready = 'true'
    }
    console.log(data.toString())
  })
  server.stderr.on('data', data => console.log(data.toString()))
}

process.on('exit', () => {
  if (server) {
    server.kill('SIGTERM')
  }
})

const projectroot = path.resolve(__dirname, '..')
let compiler;
gaze([projectroot + '/{playground,src}/{**/,}*', '!'+projectroot+'/playground/build/**'], (err, watcher) => {
  compile()
  watcher.on('all', compile)
})
gaze([projectroot+'/playground/build/client.js'],  (err, watcher) => {
  watcher.on('all', () => console.log('sending refresh') || wss.broadcast('refresh'))
})

function compile() {
  compiler = cp.spawn('yarn', ['playground:compile'], {stdio: 'inherit', cwd: projectroot})
}
