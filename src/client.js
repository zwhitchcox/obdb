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

export const obdb_ids = {}

export function mirrored_observable(obj, field, type = {}) {
  const is_array = Array.isArray(type)
  let is_new;
  const proxy =  new Proxy(type, {
    get(target, key, receiver) {
      console.log('get mirrored key', key)
      return Reflect.get(target, key, receiver)
    },
    set(target, key, new_val, receiver) {
      console.log('set mirrored key, new_val', key, new_val)
      ids[key] = ids[key] || cur_key || (is_new = true) && uuid()
      return Reflect.set(target, key, new_val, receiver)
    }
  })
  const ids = {}
  let cur_key;
  if (is_array) {
    for(const key in obj) {
      cur_key = key
      store[field].push(obj[key])
    }
  }
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
export function array_add(field, {added, index}) {
  let data;
  transaction(() => {
    data = toJS(added).reduce((prev, cur, i) => {
      const id = uuid()
      prev[id] = cur
      maps[field].splice(index + i, 0, id)
      mirror_obj(store[field][index + i], id, field)
      return prev
      }, {})
  })

  ws.send({
    type: 'array_add',
    field: field,
    data,
  })
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
