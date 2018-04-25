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
    console.log('store[field]', store[field])
    untracked(() => {
      console.log('store[field]', store[field])
      store[field] = observable([])
      console.log('store[field]', store[field])
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
    array_handle_subscription(msg.data, msg.field)
  } else if (msg.type === 'object_subscription') {
    object_handle_subscription(msg.data, msg.field)
  }
})

export function array_handle_subscription(rows, field) {
  transaction(() => {
    for (const id in rows) {
      const val = rows[id]
      store[field].push(val)
    }
  })
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
