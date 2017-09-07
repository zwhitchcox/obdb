import { isSoul, isPlain, isPrim, getId } from '../util'
const noop = () => {}

export class Obdb {
  constructor(graph = {}) {
    this.graph = JSON.parse(JSON.stringify(graph))
    this.cbs = {}
    this.idsToCbs = {}
    this.cbsToIds = {}
    this.cache = {}
  }

  subscribe(path, cb) {
    const cbId = getId()
    this.cbs[cbId] = cb
    const pathId = this.getPathIds(path)
    const allIds = this.getSubRecordIds(pathId, this.graph, {[pathId]: true})
    for (const id in allIds) (this.idsToCbs[id] || (this.idsToCbs[id] = {}))[cbId] = true
    this.cbsToIds[cbId] = allIds
    cb(allIds)
    return function unsubscribe() {
      for (const id in allIds) delete this.cbsToIds[id][cbId]
      delete cbsToIds[cbId]
    }
  }
  setIdVal(id, val) {
    this.graph[id] = val
    const update = this.getSubRecordIds(id)
    for (const cbId in this.idsToCbs[id]) {
      this.cbs[cbId](update)
    }
  }
  setIdKeyVal(id, key, val) {
    this.graph[id][key] = val
    const update = this.getSubRecordIds(id)
    for (const cbId in this.idsToCbs[id]) {
      this.cbs[cbId](update)
    }
  }
  getPathIds = getPathIds.bind(this)
  getSubRecordIds = getSubRecordIds.bind(this)
}

export function objToGraph(obj, graph, cache = new WeakMap) {
  if (!graph) {
    graph = {}
  }
  const id = getId()
  cache.set(obj, id)
  for (const key in obj) {
    const prop = obj[key]
    if (cache.has(prop)) newObj[key] = {'#': cache.get(prop)}
    else if (isPlain(prop)) newObj[key] = {'#': objToGraph(prop, graph || newObj,  cache)}
    else if (isPrim(prop)) newObj[key] = prop
    else throw new TypeError('Can\'t handle that type yet!')
  }
  if (!graph) return newObj
  graph[id] = newObj
  return id
}

export function objFromGraph(id, graph, cache) {
  if (!cache) {
    id = getPathIds(id, graph)
    cache = {}
  }
  const newObj = {}
  const record = graph[id]
  cache[id] = newObj
  let cached;
  for (const key in record) {
    const prop = record[key]
    newObj[key] = (cached = cache[(id = isSoul(prop))]) ?
      cached : id ? objFromGraph(id, graph, cache) : prop
  }
  return newObj
}

export function subscribe(path, graph, cb) {
  const pathId = getPathIds(path, graph)
  const subRecordIds = getSubRecordIds(pathId)
}

export function getPathIds(path, graph) {
  graph = graph || this.graph
  const paths = {}
  if (typeof path === 'string') path = path.split('.')
  let cur = graph, curId;
  const start = isSoul(cur[path[0]])
  for (let i = 0; i < path.length && cur; i++)
    cur = (curId = isSoul(cur[path[i]])) && (paths[curId] = true) && graph[curId]
  return [paths, start]
}

export function getPathIdsWithCreation(path, graph) {
  graph = graph || this.graph
  if (typeof path === 'string') path = path.split('.')
  let [pathIds, start] = getPathIds(path, graph)
  if (Object.keys(pathIds) === path.length)
    return pathIds
  let i = 0, cur = graph, curId;
  for (; i < path.length && cur; i++)
    (cur = (curId = isSoul(cur[path[i]])) && graph[curId])
  const newObj = cur = {}
  i--
  for (; i < path.length; i++)
    (cur = cur[path[i]] = {})
  const id = objToGraph(newObj, graph)
  const newPathIds = getPathIds(path, graph)

  return Object.assign(pathIds, newPathIds)
}

export function getSubRecordIds(id, graph, hash = {}) {
  graph = graph || this.graph
  let subId
  const record = graph[id]
  for (const key in record)
    (subId = isSoul(record[key]))
    && !hash[subId]
    && (hash[subId] = true)
    && getSubRecordIds(subId, graph, hash)
  return hash
}


//const noop = _=>{}
//let reportObserved = noop
//
//function convert(data) {
//  for (const key in data) {
//    const record = data[key]
//    for (const key in record) {
//      defineSetGet(record, key)
//    }
//  }
//}
//
//function defineSetGet(record, key) {
//  Object.defineProperty(record, key, {
//    get(newVal) {
//      record[key] = newVal
//      runReactions(newVal)
//      return newVal
//    },
//    set() {
//      reportObserved(key)
//      return record[key]
//    }
//  })
//}
//
//const callbacks = {}
//const keysToReactions = {}
//const reactionsToKeys = {}
//const subscriptions = {}
//const reactionsToSubs = {}
//
//export function attach({server, filePath, startData}) {
//  var io = require('socket.io')(server, { path: '/obdb' })
//  io.on('connection', socket => {
//    socket.on('subscribe', ([path, id]) => {
//      const disposer = autorun(() => {
//        const subscription = subscriptions[id] = {}
//        let cur = data
//        subscription[path[0]] = data[path[0]]
//        for (let i = 0; i < path.length; i++) {
//          cur = (cur[path[i]] || (cur[path[i]] = {}))
//          if (cur && Object.keys(cur) == '#') {
//            cur = subscription[cur['#']] = data[cur['#']]
//          }
//        }
//        getTree(cur, subscription)
//        socket.emit('subscription', [subscription, id, path[0]])
//      })
//    })
//    socket.on('change', ([id, key, val]) => {
//      data[id][key] = val
//    })
//  })
//}
//
//export function getTree(obj, subscription) {
//  for (const key in obj) {
//    const cur = obj[key]
//    if (cur && Object.keys(cur) == '#') {
//      getTree(subscription[cur['#']] = data[cur['#']], subscription)
//    }
//  }
//}
//
//export function autorun(cb) {
//  const rId = uuid()
//  callbacks[rId] = cb
//  observe(rId)
//  return () => {
//    for (const key in reactionsToKeys[rId])
//      delete keysToReactions[rId][key]
//    delete callbacks[rId]
//    delete reactionsToKeys[rId]
//  }
//}
//
//export function observe(rId) {
//  const prevReportObserved = reportObserved
//  for (const key in reactionsToKeys[rId])
//    keysToReactions[key][rId] = false
//  reactionsToKeys[rId] = {}
//  reportObserved = key => {
//    ;(keysToReactions[key] || (keysToReactions[key] = {}))[rId] = true
//    reactionsToKeys[rId][key] = true
//    prevReportObserved(key)
//  }
//  callbacks[rId]()
//  reportObserved = prevReportObserved
//}
//
//let inReaction = false
//const pendingReactions = []
//export function runReactions(key) {
//  for (const reaction in keysToReactions[key]) {
//    pendingReactions.push(reaction)
//    pendingReactionIndexes[reaction] = []
//      .concat(pendinReactionIndexes[reaction], pendingReactions.length)
//  }
//  if (inReaction) return
//  const curReactions = pendingReactions.slice()
//  pendingReactions.length = 0
//  for (let i = 0; i < curReactions.length; i++) {
//    for (const rId in  curReactions[i])
//      observe(rId)
//  }
//}
