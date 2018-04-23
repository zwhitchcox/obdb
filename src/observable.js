import { report_observed, report_changed } from './observations'
import uuid from 'uuid/v4'

export function observable_decorator(target, name, descriptor) {
  let val = descriptor.initializer()
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

  const proxy = new Proxy({}, {
    get(obj, prop) {

    },
    set(obj, prop, val) {

    }
  })

}


export function quacksLikeADecorator(args) {
  return (
    ((args.length === 2 || args.length === 3) && typeof args[1] === "string") ||
    (args.length === 4 && args[3] === true)
  )
}
