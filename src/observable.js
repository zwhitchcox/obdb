import { report_retrieved, report_changed, untracked, transaction } from './observation'
import uuid from 'uuid/v4'
import { ws } from './client'

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
  push(field, obdb_ids, ...new_items) {
    mutating_array_methods.splice(field, obdb_ids, obdb_ids.length, 0, ...new_items)
  },
  reverse: true,
  shift: true,
  sort: true,
  splice(field, obdb_ids, index, delete_count, ...new_items) {
    const deleted = obdb_ids.splice(index, delete_count)
    if (deleted.length) {
      ws.send({
        type: 'array_delete',
        ids: deleted,
        field,
      })
    }
    if (new_items.length) {
      const [ new_keys, update ] = new_items.reduce(([keys, update], curr) => {
        const new_key = uuid()
        keys.push(new_key)
        update[new_key] = curr
        return [keys, update]
      }, [[], {}])
      obdb_ids.splice(index, 0, new_keys)
      ws.send({
        field,
        type: 'array_add',
        data: update,
      })
    }
  },
  unshift: true,
}

export function observable(...args) {
  const original = args[0]
  const is_obdb = !!original.__obdb
  const { field, data, type } = is_obdb ? original.__obdb : {}
  const is_array = Array.isArray(original) || is_obdb && type === 'array'
  if(quacksLikeADecorator(args) && !is_obdb) return observable_decorator(...args)
  if (original !== Object(original) || original.__isProxy)
    return original
  const obdb_ids = []
  const ids = is_obdb ? Object.assign({}, original.__obdb.data) : {}
  let array;
  if (is_obdb && (array = [])) {
    for (const key in data) {
      obdb_ids.push(key)
      array.push(data[key])
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
            if(is_obdb && is_array)
              mutating_array_methods[key](field, obdb_ids, ...args)
            method.apply(target, args)
            report_changed(ids.length)
          })
        }
      }
      return Reflect.get(target, key, receiver)
    },

    set(target, key, new_val, receiver) {
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

