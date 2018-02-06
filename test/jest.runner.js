const gaze = require('gaze')
const cp = require('child_process')
const path = require('path')

const projectroot = path.resolve(__dirname, '..')
let jest;
gaze(projectroot + '/src/**', (err, watcher) => {
  runjest()
  watcher.on('all', runjest)
})
function runjest() {
  if(jest) {
    jest.kill('SIGTERM')
  }
  jest = cp.spawn('yarn', ['test'], {stdio: 'inherit', cwd: projectroot})
  printblock()
}


process.on('exit', () => {
  if (jest) {
    jest.kill('SIGTERM')
  }
})

function printblock() {
  for (var i = 0; i < 10; i++) {
    console.log('**********************************************')
  }
}
