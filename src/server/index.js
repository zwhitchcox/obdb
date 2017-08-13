import uuid from 'uuid/v4'


const noop = _=>{}
let reportObserved = noop

let data = convert({
  hello: {'#': 34},
  '34': {what: {'#': 35 }},
  '35': {is: 'up'},
})

function convert(data) {
  for (const key in data) {
    const record = data[key]
    for (const key in record) {
      defineSetGet(record, key)
    }
  }
}

function defineSetGet(record, key) {
  Object.defineProperty(record, key, {
    get(newVal) {
      record[key] = newVal
      runReactions(newVal)
      return newVal
    },
    set() {
      reportObserved(key)
      return record[key]
    }
  })
}

const callbacks = {}
const keysToReactions = {}
const reactionsToKeys = {}
const subscriptions = {}
const reactionsToSubs = {}

export function attach({server, filePath, startData}) {
  var io = require('socket.io')(server, { path: '/obdb' })
  io.on('connection', socket => {
    socket.on('subscribe', ([path, id]) => {
      const disposer = autorun(() => {
        const subscription = subscriptions[id] = {}
        let cur = data
        subscription[path[0]] = data[path[0]]
        for (let i = 0; i < path.length; i++) {
          cur = (cur[path[i]] || (cur[path[i]] = {}))
          if (cur && Object.keys(cur) == '#') {
            cur = subscription[cur['#']] = data[cur['#']]
          }
        }
        getTree(cur, subscription)
        socket.emit('subscription', [subscription, id, path[0]])
      })
    })
    socket.on('change', ([id, key, val]) => {
      data[id][key] = val
    })
  })
}

export function getTree(obj, subscription) {
  for (const key in obj) {
    const cur = obj[key]
    if (cur && Object.keys(cur) == '#') {
      getTree(subscription[cur['#']] = data[cur['#']], subscription)
    }
  }
}

export function autorun(cb) {
  const rId = uuid()
  callbacks[rId] = cb
  observe(rId)
  return () => {
    for (const key in reactionsToKeys[rId])
      delete keysToReactions[rId][key]
    delete callbacks[rId]
    delete reactionsToKeys[rId]
  }
}

export function observe(rId) {
  const prevReportObserved = reportObserved
  for (const key in reactionsToKeys[rId])
    keysToReactions[key][rId] = false
  reactionsToKeys[rId] = {}
  reportObserved = key => {
    ;(keysToReactions[key] || (keysToReactions[key] = {}))[rId] = true
    reactionsToKeys[rId][key] = true
    prevReportObserved(key)
  }
  callbacks[rId]()
  reportObserved = prevReportObserved
}

let inReaction = false
const pendingReactions = []
export function runReactions(key) {
  for (const reaction in keysToReactions[key]) {
    pendingReactions.push(reaction)
    pendingReactionIndexes[reaction] = []
      .concat(pendinReactionIndexes[reaction], pendingReactions.length)
  }
  if (inReaction) return
  const curReactions = pendingReactions.slice()
  pendingReactions.length = 0
  for (let i = 0; i < curReactions.length; i++) {
    for (const rId in  curReactions[i])
      observe(rId)
  }
}
