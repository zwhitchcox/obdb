import { observable, action, extendObservable, observe, transaction, toJS } from 'mobx'
import uuid from 'uuid/v4'
import WS from './ws'


const ws = new WS(`ws://${location.host}/obdb`)
export const maps = []
export const subscribed = observable.map({})
export const store = observable({
  subscribe(field) {
    if (Array.isArray(field)) {
      return Promise.all(field.map(this.subscribe))
    }
    if (subscribed.get(field)) return
    subscribed.set(field, true)
    extendObservable(store, {
      [field]: []
    })
    maps[field] = []
    const msg = {
      type: 'subscribe',
      field,
    }
    ws.send(msg)

    //return fetch(`/db/${field}`)
    //  .then(res => res.json())
    //  .then(rows => {
    //    transaction(() => {
    //      for (const id in rows) {
    //        const val = rows[id]
    //        store.maps[field].push(id)
    //        store[field].push(rows[id])
    //        if (Object(val) === val) {
    //          mirror_obj(store[field][store[field].length - 1], id, field)
    //        }
    //      }
    //    })
    //    observe(store[field], mirror(field))
    //  })
    //  .catch(console.error)
  },
})
ws.on_msg(msg => {
  if (msg.type === 'subscription') {
    handle_subscription(msg.data, msg.field)
  }
})

export function handle_subscription(rows, field) {
  transaction(() => {
    for (const id in rows) {
      const val = rows[id]
      maps[field].push(id)
      store[field].push(rows[id])
      if (Object(val) === val) {
        mirror_obj(store[field][store[field].length - 1], id, field)
      }
    }
  })
  observe(store[field], mirror(field))
}

export function mirror(field){
  return event => {
    if (event.type === 'splice') {
      add(field, event)
      remove(field, event)
    } else {
      update(field, event.index)
    }
  }
}
export function add(field, {added, index}) {
  let data;
  transaction(() => {
    data = toJS(added).reduce((prev, cur, i) => {
      const id = uuid()
      prev[id] = cur
      maps[field].splice(index + i, 0, id)
      return prev
        //mirror_obj(store[field][event.index + i], id, field)
      }, {})
  })

  ws.send({
    type: 'add',
    field: field,
    data,
  })
}

export function remove(field, { index, removedCount }) {
  const ids = maps[field].splice(index, removedCount)
  ws.send({
    type: 'delete',
    ids,
    field,
  })
}

export function update(field, i) {
  const value = toJS(store[field][i])
  const id = uuid()
  maps[field][i] = id

  ws.send({
    type: 'add',
    field: field,
    data: { [id]: value }
  })
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

ws.on_msg(msg => {
})
