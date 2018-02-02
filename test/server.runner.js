const gaze = require('gaze')
const cp = require('child_process')
const path = require('path')

let server;
gaze(__dirname + '/build/server.js', (err, watcher) => {
  runserver()
  watcher.on('all', runserver)
})
function runserver() {
  console.log('restarting')
  if(server) {
    server.kill('SIGTERM')
  }
  server = cp.spawn('node', [__dirname + '/build/server'], {stdio: 'inherit'})
}

process.on('exit', () => {
  if (server) {
    server.kill('SIGTERM')
  }
})

const projectroot = path.resolve(__dirname, '..')
gaze([projectroot + '/{test,src}/{**/,}*.js', '!'+projectroot+'/test/build/**'], (err, watcher) => {
  watcher.on('all', () => {
    console.log('compiling')
    cp.exec('yarn test:server:compile', {stdio: 'inherit', cwd: projectroot})
  })
})
