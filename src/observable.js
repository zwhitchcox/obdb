import { report_retrieved, report_changed } from './observations'
import uuid from 'uuid/v4'

export function observable_decorator(target, name, description) {
  let val = description.initializer()
  const id = uuid()
  return {
    get() {
      report_retrieved(id)
      return val
    },
    set(new_value) {
      if (typeof val === 'object' && !Array.isArray(val)) {
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
  let values = {}
  let ids = {}

  const proxy = new Proxy({}, {
    get(obj, prop) {
      const id = ids[prop] || (ids[prop] = uuid())
      report_retrieved(id)
      return values[prop]
    },
    set(obj, prop, val) {
      const id = ids[prop] || (ids[prop] = uuid())
      report_retrieved(id)
      values[prop] = val
      report_changed(id)
      return values[prop]
    }
  })

}


export function quacksLikeADecorator(args) {
  return (
    ((args.length === 2 || args.length === 3) && typeof args[1] === "string") ||
    (args.length === 4 && args[3] === true)
  )
}
