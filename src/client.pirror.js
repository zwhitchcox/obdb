import  { PirrorMain, createRequest } from '../src/pirror'
import WebSocket from 'ws'

export class Pirror extends PirrorMain {
  constructor({peerurls} = {}) {
    super()
    this.peers = (peerurls || [makeurlws(window.location.host)])
      .map(url => new Connection(url, this))

  }
  broadcast(data) {
    if (this.peers.length === 1) {
      return this.peers[0].update(data)
    }
    else {
      return this.peers.map(peer => peer.update(data))
    }
  }
}

export class Connection {
  pending = []
  constructor(url, parent) {
    const p = this
    this.ws = new WebSocket(url)
    this.ws.on('message', e => parent.handleMessage(e))
    this.ws.on('open', () => {
      this.pending.reverse().forEach(({res, update}) => this.ws.send(update) && res())
    })
    this.url = url
  }
  update(update) {
    return new Promise((res, req) => {
      if (this.ws.readyState === WebSocket.OPEN) this.ws.send(update) && res()
      else this.pending.push({res, update})
    })
  }
}

function makeurlws(str) {
  return 'ws://' + str.replace(/^https?:\/\//, '') + '/pirror'
}
