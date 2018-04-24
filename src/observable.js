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

export function observable(...args) {
  if(quacksLikeADecorator(args)) return observable_decorator(...args)
  const original = args[0]
  let values = Array.isArray(original) ? [] : {}
  let ids = {}

  const proxy = new Proxy(Array.isArray(original) ? [] : {}, {
    get(target, key) {
      const id = ids[key] || (ids[key] = key + uuid())
      report_retrieved(id)
      return values[key]
    },

    set(target, key, new_val) {
      if (values[key] === new_val) return values[key]
      const id = ids[key] || (ids[key] = key + uuid())
      values[key] = new_val
      report_changed(id)
      return values[key]
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
    for (const key in original) {
      values[key] = original[key]
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

