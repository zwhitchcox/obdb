import { report_observed, report_changed } from './observations'
import uuid from 'uuid/v4'

export function observable_decorator(target, name, description) {
  let val = description.initializer()
  const id = uuid()
  return {
    get() {
      report_observed
      return val
    },
    set(new_value) {
      report_changed(id)
      val = new_value
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
      reportObserved(id)
      return values[prop]
    },
    set(obj, prop, val) {
      const id = ids[prop] || (ids[prop] = uuid())
      reportObserved(id)
      values[prop] = val
      reportChanged(id)
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
