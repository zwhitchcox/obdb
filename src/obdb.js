import global from './global'
import uuid from 'uuid/v4'

const noop = () => {}
const values = {}
const reactionsToProps = {}
const propsToReactions = {}
const reactions = {}
let pendingReactions = []
let inReaction = false
let reportObserved = noop


export { makeObservable as mkob }
export function makeObservable(obj) {
  for (const key in obj) {
    const propId = uuid()
    values[propId] = obj[key]
    Object.defineProperty(obj, key, {
      get() {
        reportObserved(propId)
        return values[propId]
      },
      set(val) {
        values[propId] = val
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


const MAX_ITERATIONS = 100 // ???
let curIterations = 0
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
        + 'in your code, as this iterations has triggered over 100 other iterations')

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

function clearReactions(reactionId) {
  for (const propId in reactionsToProps[reactionId]) {
    delete propsToReactions[propId][reactionId]
  }
  delete propsToReactions[reactionId]
}

function observe(reactionId) {
  let prevReportObserved = reportObserved
  reportObserved = propId => {
    ;(propsToReactions[propId] || (propsToReactions[propId] = {}))[reactionId] = true
    ;(reactionsToProps[reactionId] || (reactionsToProps[reactionId] = {}))[propId] = true
    prevReportObserved(propId)
  }
  reactions[reactionId]()
  reportObserved = prevReportObserved
}
