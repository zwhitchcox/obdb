import io from 'socket.io-client'
import uuid from 'uuid/v5'

const callbacks = {}
export default class Obdb {
  data = {}
  constructor(peers = []) {
    peers = [].concat(peers)
    this.connections = peers.map(createConnection)
    this.connections.forEach(conn => {
      conn.on('update', ({k, d}) => {
        this.data[k] = d
      })
      conn.on('saved', key => {
        callbacks[key]()
        delete callbacks[key]
      })
    })
  }

  update(o, cb) {
    for (key in o) {
      this.data[key] = obj[key]
    }
    const k = uuid()
    this.connections.forEach(conn => {
      callbacks[k] = cb
      conn.emit('update', {o, k})
    })
  }

  replace(obj) {
    this.data = Object.assign({}, obj)
    const k = uuid()
    this.connections.forEach(conn =>
      conn.emit('replace', {o, k})
    )
  }
}

export function createConnection(peer) {
  return io(peer)
}
