import { observable, action, extendObservable, observe, transaction, toJS } from 'mobx'

export const store = observable({
  route: window.location.pathname,
  maps: [],
  subscribed: observable.map({}),

  subscribe(field) {
    if (Array.isArray(field)) {
      return Promise.all(field.map(this.subscribe))
    }
    if (store.subscribed.get(field)) return
    store.subscribed.set(field, true)
    extendObservable(store, {
      [field]: []
    })
    store.maps[field] = []
    return fetch(`/db/${field}`)
      .then(res => res.json())
      .then(rows => {
        transaction(() => {
          for (const id in rows) {
            store.maps[field].push(id)
            store[field].push(rows[id])
          }
        })
        observe(store[field], mirror(field))
      })
      .catch(console.error)
  },
})

export function mirror(field){
  return event => {
    if (event.type === 'splice') {
      event.added.forEach(add(field, event.index))
      store.maps[field]
        .splice(event.index, event.removedCount)
        .forEach(remove(field))
    } else {
      update(field, event.index)
    }
  }
}
export function add(field, main_index) {
  return (value, i) => {
    const is_json = value === Object(value)
    fetch(`/db/${field}`, {
      headers: new Headers({
        'content-type': is_json ? 'application/json' : 'text/plain',
      }),
      method: 'POST',
      body: (is_json) ? JSON.stringify(value) : value,
    })
      .then(res => res.text())
      .then(id => {
        store.maps[field].splice(main_index + i, 0, id)
      })
  }
}

export function remove(field) {
  return key => {
    fetch(`/db/${field}/${key}`, {
      headers: new Headers({
        'content-type': 'application/json',
      }),
      method: 'DELETE',
    })
  }
}

export function update(field, i) {
  const value = toJS(store[field][i])
  const is_json = value === Object(value)
  fetch(`/db/${field}/${store.maps[field][i]}`, {
    headers: new Headers({
      'content-type': is_json ? 'application/json' : 'text/plain',
    }),
    method: 'PUT',
    body: (value === Object(value)) ? JSON.stringify(value) : value,
  })
}

