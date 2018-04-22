const body_parser = require('body-parser')
const fs = require('fs-extra')
const uuid = require('uuid/v4')
const WebSocket = require('ws')
const store = {}

export class Obdb {
  constructor({dir, server}) {
    this.dir = dir
    const wss  = new WebSocket.Server({ server })
    wss.on('connection', ws => {
      ws.on('message', msg => {
        msg = JSON.parse(msg)
        if (msg.type === 'subscribe') {
          this.onSubscribe(msg.field, ws)
        } else if (msg.type === 'add') {
          this.onAdd(msg.field, msg.data)
        } else if (msg.type === 'delete') {
          this.onDelete(msg.field, msg.ids)
        } else if (msg.type === 'update') {
          this.onUpdate(msg.field, msg.data)
        }
    })
  })
}
onSubscribe(field, ws) {
  if (!store[field])
    this.get_data(field)
      .then(data => {
        ws.send(JSON.stringify({
          type: 'subscription',
          field: field,
          data: store[field] = data,
        }))
      })
      .catch(console.error)
  else ws.send(JSON.stringify({
    type: 'subscription',
    field: field,
    data: store[field],
  }))
}

onAdd(field, data) {
  for(const id in data) {
    store[field][id] = data[id]
  }
  this.write_data(field)
    .catch(console.error)
}

onDelete(field, ids) {
  ids.forEach(id => {
    if (store[field][id]) delete store[field][id]
  })
  this.write_data(field)
    .catch(console.error)
}

onUpdate(field, data) {
  for(const id in data) {
    store[field][id] = data[id]
  }
  this.write_data(field)
    .catch(console.error)
}
write_data(field) {
  const path = this.dir + '/' + field + '.json'
  return fs.ensureFile(path)
    .then(() => fs.writeJson(path, store[field]))
}
get_data(field) {
  const path = this.dir + '/' + field + '.json'
  return fs.readJson(path)
    .catch(err => {
      if (err.code ===  'ENOENT')
        fs.writeJson(path, {})
      return {}
    })
}
}



