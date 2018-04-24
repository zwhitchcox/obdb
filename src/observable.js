import { report_retrieved, report_changed, untracked } from './observations'
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
      console.log('set decorator')
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

export function observable(...args) {
  if(quacksLikeADecorator(args)) return observable_decorator(...args)
  const original = args[0]
  let values = Array.isArray(original) ? [] : {}
  let ids = {}

  const proxy = new Proxy(Array.isArray(original) ? [] : {}, {
    get(target, prop) {
      const id = ids[prop] || (ids[prop] = prop + uuid())
      report_retrieved(id)
      return values[prop]
    },

    set(target, prop, new_val) {
      if (values[prop] === new_val) return values[prop]
      const id = ids[prop] || (ids[prop] = prop + uuid())
      values[prop] = new_val
      report_changed(id)
      return values[prop]
    },
    deleteProperty (target, key) {
      delete values[key]
      report_changed(ids[key])
      delete ids[key]
      return true
    },
    enumerate(target, key) {
      for(const id in ids)
        report_retrieved(id)
      return Object.keys(values)
    },
    ownKeys(target, key) {
      for(const id in ids)
        report_retrieved(id)
      return Object.keys(values)
    },
    has(target, key) {
      return key in values || target.hasItem(key);
    },
    defineProperty(target, key, oDesc) {
      if (oDesc && 'value' in oDesc) { values[key] = oDesc.value }
      return target
    },
    getOwnPropertyDescriptor(target, key) {
      var vValue = values[key]
      return vValue ? {
        value: vValue,
        writable: true,
        enumerable: true,
        configurable: true
      } : undefined
    },
  })

  untracked(_ => {
    for (const prop in original) {
      values[prop] = original[prop]
    }
  })

  for (const key in values) {
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
