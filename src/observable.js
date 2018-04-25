import { report_retrieved, report_changed, untracked } from './observation'
import uuid from 'uuid/v4'

export function observable_decorator(target, name, description) {
  let val = description.initializer()
  const id = name + uuid()
  if (typeof val === 'object') {
    val = observable(val)
  }
  return {
    get() {
      report_retrieved(id)
      return val
    },
    set(new_value) {
      if (typeof val === 'object') {
        val = observable(new_value)
      } else {
        val = new_value
      }
      report_changed(id)
      return val
    },
    enumerable: true,
    configurable: true
  }
}

export const mutating_array_methods = {
  copyWithin: true,
  fill: true,
  pop: true,
  push: true,
  reverse: true,
  shift: true,
  sort: true,
  splice: true,
  unshift: true,
}

export function observable(...args) {
  if(quacksLikeADecorator(args)) return observable_decorator(...args)
  const original = args[0]
  if (original !== Object(original) || original.__isProxy)
    return original
  let is_array = Array.isArray(original)
  let ids = {}
  

  const proxy = new Proxy(original, {
    get(target, key, receiver) {
      if(key === '__isProxy') return true
      let id;
      id = (typeof ids[key]==='function' && key + uuid()) || ids[key] || (ids[key] = key + uuid())
      report_retrieved(id)
      if(key in mutating_array_methods && is_array) {
        const method = Reflect.get(target, key, receiver)
        return function(...args) {
          method.apply(target, args)
          report_changed(ids.length)
        }
      }
      return Reflect.get(target, key, receiver)
    },

    set(target, key, new_val, receiver) {
      if (target[key] === new_val) return target[key]
      let id;
      if(key === 'length') id = (length = key + uuid())
      id = id || ids[key] || (ids[key] = key + uuid())
      report_changed(id)
      return Reflect.set(target, key, observable(new_val), receiver)
    },
  })


  for (const key in original) {
    proxy[key]
  }
  return proxy
}

export function quacksLikeADecorator(args) {
  return (
    ((args.length === 2 || args.length === 3) && typeof args[1] === "string") ||
    (args.length === 4 && args[3] === true)
  )
}

