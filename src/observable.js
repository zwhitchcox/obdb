import { report_retrieved, report_changed, untracked, transaction } from './observation'
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
  const original = args[0]
  const is_obdb = !!original.__obdb
  if(quacksLikeADecorator(args) && !is_obdb) return observable_decorator(...args)

  if (original !== Object(original) || original.__isProxy)
    return original
  const is_array = Array.isArray(original)
  const fn_ids = {}
  const obdb_ids = is_obdb ? Object.assign({}, original.__obdb.data) : {}
  const ids = is_obdb ? Object.assign({}, original.__obdb.data) : {}
  let array;
  if (is_obdb && (array = [])) {
    for (const key in original.__obdb.data) {
      array.push(original.__obdb.data[key])
    }
  }

  const proxy = new Proxy(array || original, {
    get(target, key, receiver) {
      if(key === '__isProxy') return true
      let id;
      id = (typeof ids[key]==='function' &&  key + uuid()) || ids[key] || (ids[key] = key + uuid())
      report_retrieved(id)
      if(key in mutating_array_methods && is_array) {
        const method = Reflect.get(target, key, receiver)
        return function(...args) {
          transaction(_ => {
            method.apply(target, args)
            report_changed(ids.length)
          })
          if (is_obdb) {
            for (const id_key in ids) {
              if (id_key !== 'length' && !(id_key in obdb_ids))
                ws.send({
                  type: 'array_add',
                  field,
                  data: {[id]: new_val},
                })
            }
            for (const obdb_id_key in obdb_ids) {
              if (!(id_key in obdb_ids))
                ws.send({
                  type: 'array_delete',
                  field,
                  data: {ids: id_key},
                })
            }
          }
        }
      }
      return Reflect.get(target, key, receiver)
    },

    set(target, key, new_val, receiver) {
      console.log('new_val', JSON.stringify(new_val))
      if (target[key] === new_val) return target[key]
      const id = ids[key] || (ids[key] = key + uuid())
      const return_val = Reflect.set(target, key, observable(new_val), receiver)
      report_changed(id)
      return return_val
    },
  })


  if (!is_obdb) {
    for (const key in original) {
      proxy[key]
    }
  }
  return proxy
}

export function quacksLikeADecorator(args) {
  return (
    ((args.length === 2 || args.length === 3) && typeof args[1] === "string") ||
    (args.length === 4 && args[3] === true)
  )
}

