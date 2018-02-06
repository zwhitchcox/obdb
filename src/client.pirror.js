import  { PirrorMain, createRequest } from '../src/pirror'
import WebSocket from 'ws'

export class Pirror extends PirrorMain {
  constructor({peerurls} = {}) {
    super()
    this.peers = (peerurls || [makeurlws(window.location.host)])
      .map(url => new Connection(url, this))

  }
  broadcast(data) {
    this.peers.forEach(peer => peer.update(data))
  }
}

export class Connection {
  pending = []
  constructor(url, parent) {
    const p = this
    this.ws = new WebSocket(url)
    this.ws.on('message', e => parent.handleMessage(e))
    this.ws.on('open', () => {
      this.pending.reverse().forEach(this.update.bind(p))
    })
    this.url = url
  }
  update(data) {
    const update = data
    if (this.ws.readyState === WebSocket.OPEN)
      this.ws.send(JSON.stringify(update))
    else this.pending.push(data)
  }
}

function makeurlws(str) {
  return 'ws://' + str.replace(/^https?:\/\//, '') + '/pirror'
}
