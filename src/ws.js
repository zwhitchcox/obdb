export default class WS {
  open = false
  pending = []
  msg_listeners = []
  constructor(path) {
    this.ws = new WebSocket(path)
    this.ws.addEventListener('open', () => (this.open = true) && this.send_pending())
    this.ws.addEventListener('close', () => this.open = false)
    this.ws.addEventListener('message', ({data}) => this.msg_listeners.forEach(fn => fn(JSON.parse(data))))
  }
  send(msg) {
    if (this.open) {
      this.ws.send(JSON.stringify(msg))
    } else {
      this.pending.push(msg)
    }
  }
  send_pending() {
    while(this.pending.length && this.open)
      this.send(this.pending.shift())
  }
  on_msg(fn) {
    this.msg_listeners.push(fn)
  }
}

