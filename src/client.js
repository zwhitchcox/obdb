import uuid from 'uuid/v4'
import WS from './ws'
import { observable, transaction, untracked } from './obdb'


const ws = new WS(`ws://${location.host}/obdb`)
export const maps = []
export const subscribed = {}
export const store = observable({
})
export function subscribe(field, type = {}) {
  if (Array.isArray(field)) {
    return Promise.all(field.map(field => this.subscribe(field)))
  }
  if (subscribed[field]) return
  subscribed[field] = true

  if (Array.isArray(type)) {
    untracked(() => {
      store[field] = observable([])
    })
    ws.send({
      type: 'array_subscribe',
      field,
    })
  } else if (typeof type === 'object') {
    untracked(() => {
      store[field] = observable({})
    })
    ws.send({
      type: 'object_subscribe',
      field,
    })
  }
}
ws.on_msg(msg => {
  if (msg.type === 'array_subscription') {
    store[msg.field] = mirrored_observable(msg.data, msg.field, [])
  } else if (msg.type === 'object_subscription') {
    object_handle_subscription(msg.data, msg.field)
  }
})


export function mirrored_observable(obj, field, type = {}) {
  const is_array = Array.isArray(type)
  let is_new;
  let mapping;
  let cur_key;
  const proxy =  new Proxy(type, {
    get(target, key, receiver) {
      if ('__isMirroredProxy' === key) return true
      return Reflect.get(target, key, receiver)
    },
    set(target, key, new_val, receiver) {
      const id = uuid()
      if (mapping) {
        key_map[id] = cur_key
      } else {
        ws.send({
          type: 'array_add',
          field,
          data: {[id]: new_val},
        })
      }
      return Reflect.set(target, key, new_val, receiver)
    }
  })
  const key_map = {}
  const ids = {}
  mapping = true
  if (is_array) {
    for(const key in obj) {
      cur_key = key
      store[field].push(obj[key])
    }
  }
  mapping = false
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
