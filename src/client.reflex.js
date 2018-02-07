import WebSocket from 'ws'

export class Reflex {
  pending = []
  data = {}

  constructor({url, name}) {
    this.name = name
    this.closed = true
    this.ws = new WebSocket(url || makeurlws(window.localhost.href))
    this.ws.on('message', e => this.handleMessage(e, this.ws))
    this.ws.on('open', () => (this.open = true) && this.sendPending())
    this.ws.on('close', () => this.closed = true)
  }

  broadcast(msg, sender) {
    msg = JSON.stringify(msg)
    if (this.open)
      this.ws.send(msg)
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
  }

  handleMessage(msg, sender) {
    const parsed = JSON.parse(msg)
    if (parsed.type === 'update') {
      this.update(parsed.data, sender)
    }
  }
}

function makeurlws(str) {
  return 'ws://' + str.replace(/^https?:\/\//, '') + '/reflex'
}
