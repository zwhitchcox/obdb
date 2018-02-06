const chalk = require('chalk')
global.log = addLog
global.writelog = writelog

let logItems;
let logOnlyItems;

function addLog(...args) {
  const stack = (new Error).stack.split('\n')[2]
  const filenameandnumber = stack.substr(stack.indexOf('/'), stack.indexOf(')')  - stack.indexOf('/'))
  logItems.push({args, filenameandnumber})
}

addLog.only = function(...args) {
  const stack = (new Error).stack.split('\n')[2]
  const filenameandnumber = stack.substr(stack.indexOf('/'), stack.indexOf(')')  - stack.indexOf('/'))
  logOnlyItems.push({args, filenameandnumber})
}

addLog.skip = () => {}

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
    let logStrings;
    if (logOnlyItems.length) {
      logStrings = logOnlyItems.map(getLogString)
    } else {
      logStrings = logItems.map(getLogString)
    }
    if (logStrings.length) console.log(logStrings.reduce((prev, cur) => prev + cur + '\n\n',''))
  } catch (e) {
    console.log(e)
  }
})

function getLogString({args, filenameandnumber}) {
  const stringifiedArgs = args.map(arg => (typeof arg === 'object') ? chalk.blue(JSON.stringify(arg, true, 2)) : chalk.green(arg))
  return stringifiedArgs.join(' ') +  '\n' + chalk.yellow(filenameandnumber)
}
