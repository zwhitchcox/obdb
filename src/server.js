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
        if (msg.type === 'array_subscribe') {
          this.onArraySubscribe(msg.field, ws)
        } else if (msg.type === 'array_add') {
          this.onArrayAdd(msg.field, msg.data)
        } else if (msg.type === 'array_delete') {
          this.onArrayDelete(msg.field, msg.ids)
        } else if (msg.type === 'array_update') {
          this.onArrayUpdate(msg.field, msg.data)
        }
      })
    })
  }
  onArraySubscribe(field, ws) {
    if (!store[field])
      this.get_data(field)
        .then(data => {
          ws.send(JSON.stringify({
            type: 'array_subscription',
            field: field,
            data: store[field] = data,
          }))
        })
        .catch(console.error)
    else ws.send(JSON.stringify({
      type: 'array_subscription',
      field: field,
      data: store[field],
    }))
  }

  onArrayAdd(field, data) {
    for(const id in data) {
      store[field][id] = data[id]
    }
    this.write_data(field)
      .catch(console.error)
  }

  onArrayDelete(field, ids) {
    ;(ids).forEach(id => {
      if (store[field][id]) delete store[field][id]
    })
    this.write_data(field)
      .catch(console.error)
  }

  onArrayUpdate(field, data) {
    console.log('data', data)
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
