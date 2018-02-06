const glob = require('glob')
const gaze = require('gaze')
require('babel-register')
require('babel-polyfill')
require('source-map-support/register')
const path = require('path')

const projectroot = path.resolve(__dirname, '..')
global.it = function(description, fn) {
  its.push({description, fn})
}
global.beforeAll = function(fn) {
  beforeAllFns.push(fn)
}

let beforeAllFns = [];
let its = [];

gaze(projectroot + '/src/{**/,}*.js', (err, watcher) => {
  watcher.on('all', start)
  start()
})

function start() {
  console.log('started')
  glob(projectroot + '/src/{**/,}*.test.js',{},  (err, files) => {
    files.forEach(file => require(file))
    runTests()
  })
}

let curTest = 0
runTests()
function runTests() {
  beforeAllFns.forEach(fn => fn())
}

for (let i = 0; i < its.length; i++) {
    runIt(its[i])
  }
function runIt({description, fn}, done) {
  return new Promise((res, rej) => {
    try {
      if (fn.length === 1) {
        fn(res)
      } else {
        fn()
        res()
      }
    } catch (e) {
      console.log(description + ' failed')
      console.log(e)
      return 
    }
    console.log(description + ' suceeded')
  })
}

function log(...args) {
  const stack = (new Error).stack.split('\n')[2]
  const filenameandnumber = stack.substr(stack.indexOf('/'), stack.indexOf(')') - 1)
  return
  if (args.length === 2) {
    console.log(args[0], JSON.stringify(args[1], true, 2))
  } else if (args.length === 1) {
    console.log(JSON.stringify(args[0], true, 2))
  } else {
    console.log('*****************')
    args.forEach(arg => console.log(JSON.stringify(arg, true, 2)))
    console.log('*****************')
  }
  console.log(filenameandnumber)
}
function writelog(str) {
  const projectroot = require('path').resolve(__dirname, '..')
  require('fs').writeFile(projectroot+ '/error.log', str)
}
