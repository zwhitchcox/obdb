import global from './global'
import uuid from 'uuid/v4'
import { isPlainObject } from './util'
import io from 'socket.io-client'

const MAX_ITERATIONS = 100
const noop = () => {}

const reactionsToProps = {}
const propsToReactions = {}
const reactions = {}

let curIterations = 0
let pendingReactions =  []
let inReaction = false
let reportObserved = noop

export default function Obdb(options = {}) {
  options.peers = [].concat(options.peers)
  Object.assign(options, {})
  const returnFn = makeObservable()
  return {
    mkob: makeObservable
  }
 }

export { makeObservable as mkob }
export makeObservable = ({peers = [], delimiter = '.'}) => path => obj => {
  peers = [].concat(peers)
  const connections = peers.map(io)
  connections.forEach(socket => socket.on('connect', () => console.log('connected')))
  path = (typeof path === string) ? 
    path.split(delimiter) : path
  for (const key in obj) {
    let val;
    const propId = uuid()
    val = obj[key]
    Object.defineProperty(obj, key, {
      get() {
        reportObserved(propId)
        return val
      },
      set(newVal) {
        val = newVal
        reportObserved(propId)
        triggerReactions(propId)
        return val
      }
    })
  }
}

export { autorun as aur }
export function autorun(cb) {
  const reactionId = uuid()
  reactions[reactionId] = cb
  observe(reactionId)
  return () => {
    clearReactions(reactionId)
    delete reactions[reactionId]
  }
}

export function triggerReactions(propId) {
  curIterations++
  pendingReactions.push(propId)
  if (inReaction) return
  const newReactions = pendingReactions.slice()
  pendingReactions = []
  curIterations = 0
  inReaction = true
  do {
    if (curIterations > MAX_ITERATIONS)
      throw new Error('Looks like there\'s an infinite loop'
        + ' in your code, as this iterations has triggered over 100 other iterations')

    for (let i = 0; i < newReactions.length; i++)  {
      const curReactions = propsToReactions[newReactions[i]]
      for (const curReaction in curReactions) {
        clearReactions(curReaction)
        observe(curReaction)
      }
    }
  } while (pendingReactions.length)
  inReaction  = false
}

export function clearReactions(reactionId) {
  for (const propId in reactionsToProps[reactionId]) {
    delete propsToReactions[propId][reactionId]
  }
  delete propsToReactions[reactionId]
}

export function observe(reactionId) {
  let prevReportObserved = reportObserved
  reportObserved = propId => {
    ;(propsToReactions[propId] || (propsToReactions[propId] = {}))[reactionId] = true
    ;(reactionsToProps[reactionId] || (reactionsToProps[reactionId] = {}))[propId] = true
    prevReportObserved(propId)
  }
  reactions[reactionId]()
  reportObserved = prevReportObserved
}
