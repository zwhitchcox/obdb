import global from './global'
import uuid from 'uuid/v4'

const noop = () => {}

export default class Obdb {
  values = {}
  curIterations = 0
  reactionsToProps = {}
  propsToReactions = {}
  pendingReactions =  []
  inReaction =  false
  reportObserved = noop
  reactions = {}

  constructor(options) {
    Object.assign(this, options, {
      peers: [],
      maxIterations: 100,
    })
    this.mkob = this.makeObservable.bind(this)
    this.aur = this.autorun.bind(this)
  }

  makeObservable(obj) {
    const that = this
    for (const key in obj) {
      const propId = uuid()
      that.values[propId] = obj[key]
      Object.defineProperty(obj, key, {
        get() {
          that.reportObserved(propId)
          return that.values[propId]
        },
        set(val) {
          that.values[propId] = val
          that.reportObserved(propId)
          that.triggerReactions(propId)
          return val
        }
      })
    }
  }

  autorun(cb) {
    const reactionId = uuid()
    this.reactions[reactionId] = cb
    this.observe(reactionId)
    return () => {
      this.clearReactions(reactionId)
      delete this.reactions[reactionId]
    }
  }

  triggerReactions(propId) {
    this.curIterations++
    this.pendingReactions.push(propId)
    if (this.inReaction) return
    const newReactions = this.pendingReactions.slice()
    this.pendingReactions = []
    this.curIterations = 0
    this.inReaction = true
    do {
      if (this.curIterations > this.MAX_ITERATIONS)
        throw new Error('Looks like there\'s an infinite loop'
          + 'in your code, as this iterations has triggered over 100 other iterations')

      for (let i = 0; i < newReactions.length; i++)  {
        const curReactions = this.propsToReactions[newReactions[i]]
        for (const curReaction in curReactions) {
          this.clearReactions(curReaction)
          this.observe(curReaction)
        }
      }
    } while (this.pendingReactions.length)
    this.inReaction  = false
  }

  clearReactions(reactionId) {
    for (const propId in this.reactionsToProps[reactionId]) {
      delete this.propsToReactions[propId][reactionId]
    }
    delete this.propsToReactions[reactionId]
  }
  observe(reactionId) {
    let prevReportObserved = this.reportObserved
    this.reportObserved = propId => {
      ;(this.propsToReactions[propId] || (this.propsToReactions[propId] = {}))[reactionId] = true
      ;(this.reactionsToProps[reactionId] || (this.reactionsToProps[reactionId] = {}))[propId] = true
      prevReportObserved(propId)
    }
    this.reactions[reactionId]()
    this.reportObserved = prevReportObserved
  }
}
