const gaze = require('gaze')
const cp = require('child_process')
const path = require('path')
const express = require('express')
const app = express()

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.listen(3002)
let ready = 'false'
app.get('/ready', (req, res) => res.send(ready))

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
gaze([projectroot + '/{test,src}/{**/,}*', '!'+projectroot+'/test/build/**'], (err, watcher) => {
  compile()
  watcher.on('all', compile)
})

function compile() {
  compiler = cp.spawn('yarn', ['test:compile'], {stdio: 'inherit', cwd: projectroot})
}
