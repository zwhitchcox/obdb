import { getKey } from './keys'
import { isPrimitive, isPlainObject } from './util'

export function set(obj, key, val) {
  if (vals.has(obj[key]))
    return obj[key] = val

  const lookupKey = getKey()
  let underlyingVal;
  Object.defineProperty(obj, key, {
    set(val) {
      if (vals.has(val)) {
        return underlyingVal = val
      }
      return underlyingVal = parse(val, lookupKey)
    },
    get() {
      observed[lookupKey] = true
      return underlyingVal
    },
    enumerable: true,
    configurable: false,
  })
  obj[key] = val
}

export function startObservation() {
  observing = true
  observed = {}
}

export function getObserved() {
  return Object.keys(observed)
}

export function endObservation() {
  observing = false
}

export function parse(val, lookupKey) {
  if (isPrimitive(val)) {
  } else if (isPlainObject(val)) {
    for (const key in val) {
      set(val, key, val[key])
    }
    vals.set(val, key)
  } else {
    throw new Error('sorry, we don\'t support that data type just yet :(')
  }

  keys[lookupKey] = val
  return val
}

export let observing = false
export let observed = {}
export let keys = {}
export let vals = new WeakMap
