const chalk = require('chalk')
global.log = addLog
global.writelog = writelog
global.waitUntil = waitUntil
global.checkData = checkData

let logItems;
let logOnlyItems;

function addLog(...args) {
  const stack = (new Error).stack.split('\n')[2]
  const beg = stack.indexOf('/')
  const end = ~stack.indexOf(')') ? stack.indexOf(')') - beg : undefined
  const filenameandnumber = stack.substr(beg, end)
  logItems.push(getLogString({args, filenameandnumber}))
}

addLog.only = function(...args) {
  const stack = (new Error).stack.split('\n')[2]
  const filenameandnumber = stack.substr(stack.indexOf('/'), stack.indexOf(')')  - stack.indexOf('/'))
  logOnlyItems.push(getLogString({args, filenameandnumber}))
}

addLog.skip = () => {}
addLog.fullstack = function(...args) {
  const stack = (new Error).stack.split('\n').slice(1).join('\n')
  logItems.push(getLogString({args, filenameandnumber: stack}))
}

function writelog(str) {
  const projectroot = require('path').resolve(__dirname, '..')
  require('fs').writeFile(projectroot+ '/error.log', str)
}

beforeAll(() => {
  logItems = []
  logOnlyItems = []
})

afterAll(() => {
  try {
    if (logOnlyItems.length) {
      console.log('\n' + logOnlyItems.join('\n\n'))
    } else if (logItems.length) {
      console.log('\n' + logItems.join('\n\n'))
    }
  } catch (e) {
    console.log(e)
  }
})

function getLogString({args, filenameandnumber}) {
  const stringifiedArgs = args.map(arg => (typeof arg === 'object') ? chalk.blue(JSON.stringify(arg, true, 2)) : chalk.green(arg))
  return stringifiedArgs.join(' ') +  '\n' + chalk.yellow(filenameandnumber)
}


function waitUntil(condition) {
  return new Promise((res, rej) => {
    const startTime = +new Date
    function check() {
      if (condition())
        res()
      else
        setTimeout(check, 10)
    }
    check()
  })
}

function checkData(reflex, data) {
  return Object.keys(data).every(key => {
    return data[key] === reflex.data[key]
  })
}
