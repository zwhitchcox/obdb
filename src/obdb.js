import io from 'socket.io-client'
import uuid from 'uuid/v4'

const pending = {}
const noop = _=>{}
const queriesToIds = {}
const idsToQueries = {}
const queriesToData = {}

export let reportObserved = noop

const socket = io(window.location.href, { path: '/obdb' })
socket.emit('change', ['1234', '5678'])
socket.on('return', ([data, id, start]) => {
  const query = idsToQueries[id] 
  const path = JSON.parse(query)
  const {
    resolve,
    reject,
  } = pending[id]
  let cur = data
  let i = 1
  for (let i = 0; i < path.length; i++) {
    cur = cur[path[i]]
    if (cur && Object.keys(cur) == '#') {
      cur = data[cur['#']]
    } else {
      throw new Error(`${cur} is not an object at ${path[1]}`)
    }
  }
  const tree = buildTree(cur, {}, data)
  resolve(tree)
  queriesToData[query] = tree
})

export function buildTree(obj, tree, data) {
  for (const key in obj) {
    const cur = obj[key]
    if (cur && Object.keys(cur) == '#') {
      tree[key] = buildTree(data[cur['#']], {}, data)
    } else {
      tree[key] = cur
    }
  }
  return tree
}

export async function observable(path, cb) {
  path = typeof path === 'string' ? path.split('.') : [].concat(path)
  const id = uuid()
  const query = JSON.stringify(path)
  if (queriesToData[query]) return queriesToData[query]
  queriesToIds[query] = id
  idsToQueries[id] = query
  return new Promise((resolve, reject) => {
    pending[id] = {resolve, reject}
    socket.emit('subscribe', [path, id])
  })
}

let b;

autorun(async () => {
  const b = await observable('hello.what')
  console.log('b', b)
  console.log(b.is)
})

let observing; 
export async function autorun(cb) {
  observing = true
  cb()
  observing = false
}
