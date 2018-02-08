import EventEmitter from 'events'
const WebSocket = (typeof window !== 'undefined') ? window.WebSocket : require('ws')

export class Reflex extends EventEmitter {
  pending = []
  data = {}

  constructor({url, name} = {}) {
    super()
    this.name = name
    this.closed = true
    this.ws = new WebSocket(url || makeurlws(window.location.href))
    this.ws.onmessage = e => this.emit('message', e)
    this.ws.onopen = e => this.emit('open', e)
    this.ws.onclose = e => this.emit('close', e)
    this.ws.onerror = e => this.emit('error', e)
    this.on('message', e => this.handleMessage(e.data, this.ws))
    this.on('open', () => (this.open = true) && this.sendPending())
    this.on('close', () => this.closed = true)
  }

  broadcast(msg, sender) {
    msg = JSON.stringify(msg)
    if (this.open) {
      this.ws.send(msg)
    }
    else
      this.pending.push(msg)
  }

  sendPending() {
    const batch = this.pending.slice().reverse()
    this.pending = []
    while(batch.length) this.ws.send(batch.pop())
  }

  update(update, sender) {
    const toBroadcast = {}
    for (const key in update) {
      if (this.data[key] !== update[key])
        this.data[key] = toBroadcast[key] = update[key]
    }
    if (Object.keys(toBroadcast).length && !sender)
      this.broadcast({type: 'update', data: toBroadcast})
    this.emit('update', this.data)
  }

  handleMessage(msg, sender) {
    const parsed = JSON.parse(msg)
    if (parsed.type === 'update') {
      this.update(parsed.data, sender)
    }
  }
}

function makeurlws(str) {
  return 'ws://' + str.replace(/^https?:\/\//, '') + 'reflex'
}
