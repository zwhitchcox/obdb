import uuid from 'uuid/v1'

const db = {}
const noop = () => {}
let announceObserved = noop
const observers = {}

export function ob(obj) {
  const newObj = {}
  for (const key in obj) {
    const id = uuid()
    Object.defineProperty(newObj, key,
      get() {
        announce(id)
        return db[id]
      },
      set(newVal) {
        runObservers(id)
        db[id] = newVal
      }
    )
  }
  return newObj
}

export function observe(observer) {
  const observerid = uuid()
  const observed = {}
  const prevAnnounce = announce
  announce = id => observed[id] = true
  announce = prevAnnounce
  observers[id] = observed
}

export function runObservers(id) {

}
