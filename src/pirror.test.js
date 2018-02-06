import { Pirror as PirrorServer } from './server.pirror'
import { Pirror as PirrorClient } from './client.pirror'
const PORT = 4000
const express = require('express')
const app = express()
const pirror = {}

beforeAll(done => {
  const server = app.listen(PORT, () => {
    log('listening')
    pirror.server = new PirrorServer({server})                                      
    pirror.client = new PirrorClient({peerurls: [`ws://localhost:${PORT}/pirror`]})
    pirror.server.name = 'pirror.server'
    pirror.client.name = 'pirror.client'
    done()
  })
})

it('literally nothing', () => {
  pirror.client.setData({hello: 'hi'})
  pirror.server.setData({serverhello: 'hi'})
  return waituntil(() => pirror.server.data.hello)
    .then(() => {
      log.skip('client', pirror.client.data)
      log.skip('server', pirror.server.data)
    })
}, 2000)


function waituntil(condition) {
  log('running wait until')
  return new Promise((res, rej) => {
    const startTime = +new Date
    function check() {
      if (condition())
        res()
      else
        setTimeout(check, 10)
    }
    check()
  })
}
