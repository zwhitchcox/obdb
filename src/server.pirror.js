import { PirrorMain } from './pirror'
require('source-map-support').install()
const url = require('url')
const WS = require('ws')
const express = require('express')



export class Pirror extends PirrorMain {
  constructor({server}) {
    super(server)
    if (!server) throw new TypeError('We require a server!')
    this.wss = new WS.Server({noServer: true})
    server.on('upgrade', (req, socket, head) => {
      const pathname = url.parse(req.url, true)
      if (pathname.href === '/pirror') {
        this.wss.handleUpgrade(req, socket, head, ws => {
          this.wss.emit('connection', ws)
          ws.on('message', msg => {
            this.handleMessage(msg)
            this.setData({x: 33})
          })
        })
      }
    })
  }
  broadcast(msg) {
    this.wss.clients.forEach(client => {
      client.send(msg)
    })
  }
}
