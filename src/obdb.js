import io from 'socket.io-client'
import uuid from 'uuid/v4'
import {isPrim, isPlain, isSoul} from './util'

const pending = {}
const noop = _=>{}
const queriesToIds = {}
const idsToQueries = {}
const queriesToData = {}
let data = new WeakMap

export let reportObserved = noop

const socket = io(window.location.href, { path: '/obdb' })
socket.on('subscription', ([newData, id, start]) => {
  for (const key in newData) {
    data.set(key, newData)
  }
  const query = idsToQueries[id] 
  const path = JSON.parse(query)
  const {resolve, reject} = pending[id]
  delete pending[id]
  let cur = data
  for (let i = 0; i < path.length; i++) {
    cur = cur[path[i]]
    if (cur && Object.keys(cur) == '#') cur = data[cur['#']]
    else throw new Error(`${cur} is not an object at ${path[1]}`)
  }
  resolve()
  queriesToData[query]
})

const soulsToTrees = {}
const treesToSouls = new WeakMap
export function buildTree(soul) {
  const tree = {}
  const obj = data[soul]
  for (const key in obj) {
    const cur = obj[key]
    let soul = isSoul(cur)
    if (soul) {
      let val
      if (!(val = soulsToTrees[soul]))
        val = buildTree(soul)
      Object.defineProperty(tree, key, {
        get = _ => val,
        set = newVal => val = track(newVal)
      })
    } else {
      tree[key] = cur
    }
  }
  return tree
}

export function track(val) {
  if (isPrim(val)) return val
  if (treesToSouls.has(newVal)) return newVal
  if (isPlain(val)) {
    const id = uuid()
    const newObj = {}
    for (const key in val) {
      Object.defineProperty(newObj, key, {
        get = _ => prop,
        set = newVal => val = track(newVal)
      })
    }
    soulsToTrees[id] = newObj
    treesToSouls.set(newObj, id)
    return newObj
  } else throw new TypeError('Can\'t track that data type yet!')
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


let observing; 
export async function autorun(cb) {
  observing = true
  cb()
  observing = false
}
