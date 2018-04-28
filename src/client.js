import uuid from 'uuid/v4'
import WS from './ws'
import { observable, transaction, untracked } from './obdb'


export const ws = new WS(`ws://${location.host}/obdb`)
export const maps = []
export const subscribed = {}
export const store = observable({})
export function subscribe(field, type = {}) {
  if (Array.isArray(field)) {
    return this.subscribe(field)
  }
  if (subscribed[field]) return
  subscribed[field] = true

  if (Array.isArray(type)) {
    store[field] = Object.freeze([])
    ws.send({
      type: 'array_subscribe',
      field,
    })
  } else if (typeof type === 'object') {
      store[field] = observable({}, field)
    ws.send({
      type: 'object_subscribe',
      field,
    })
  }
}

ws.on_msg(msg => {
  if (msg.type === 'array_subscription') {
    const {field, data} = msg
    store[field] = observable({__obdb: {field, data, type: 'array', store}})
  } else if (msg.type === 'object_subscription') {
    object_handle_subscription(msg.data, msg.field)
  }
})


export function mirrored_observable(obj, field, type = {}) {
  const ids = {}
  let mutating;
  const is_array = Array.isArray(type)
  untracked(() => {
    const update_array = _ => {
      const count_hash_seen = Object.assign({}, count_hash)
      type.forEach(val => {
        key_map.get
      })
    }
  })
  const proxy =  new Proxy(type, {
    get(target, key, receiver) {
      if ('__isMirroredProxy' === key) return true
      const id = ids[key] || (ids[key] = key + uuid())
      if(key in mutating_array_methods && is_array) {
        const method = Reflect.get(target, key, receiver)
        return function(...args) {
          mutating = true
          method.apply(target, args)
          mutating = false
          update_array()
        }
      }
      return Reflect.get(target, key, receiver)
    },
    set(target, key, new_val, receiver) {
      if (key === 'length' || mutating) return Reflect.set(target, key, new_val, receiver)
      if (mapping) {
        key_map[field][id] = cur_key
      } else if (!key_map[field][id]){
      }
      return Reflect.set(target, key, new_val, receiver)
    }
  })
  return proxy
}

export function array_mirror(field){
  return event => {
    if (event.type === 'splice') {
      array_add(field, event)
      array_remove(field, event)
    } else {
      array_update(field, event)
    }
  }
}
export function array_add(field, ) {
}

export function array_remove(field, { index, removedCount }) {
  const ids = maps[field].splice(index, removedCount)
  ws.send({
    type: 'array_delete',
    ids,
    field,
  })
}

export function array_update(field, {newValue, index}) {
  array_remove(field, {index, removedCount: 1})
  array_add(field, {added: [newValue], index})
}

export function mirror_obj(obj, id, field) {
  observe(obj, e => {
    update_obj(field, id, e.object)
  })
}
export function update_obj(field, id, value) {
  const data = {
    [id]: toJS(value)
  }
  ws.send({
    type: 'update',
    field,
    data,
  })
}

export function object_mirror(field, obj) {

}
