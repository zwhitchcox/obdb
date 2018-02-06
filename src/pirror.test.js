import { Pirror as PirrorServer } from './server.pirror'
import { Pirror as PirrorClient } from './client.pirror'
const PORT = 4000
const express = require('express')
const app = express()
const pirror = {}

beforeAll(done => {
  const server = app.listen(PORT, () => {
    pirror.server = new PirrorServer({server})                                      
    pirror.client = new PirrorClient({peerurls: [`ws://localhost:${PORT}/pirror`]})
    pirror.server.name = 'pirror.server'
    pirror.client.name = 'pirror.client'
    done()
  })
})

it('server and client update each other', async () => {
  await pirror.client.setData({clienthello: 'hi'})
  pirror.server.setData({serverhello: 'hi'})
  return waitUntil(() => pirror.server.data.clienthello && pirror.client.data.serverhello)
    .then(() => {
      const expectedResult = {
        clienthello: 'hi',
        serverhello: 'hi',
      }
      expect(pirror.client.data).toEqual(expectedResult)
      expect(pirror.server.data).toEqual(expectedResult)
    })
    .then(() => {
      pirror.client.setData({x: 33})
    })
    .then(waitUntil(()=> pirror.server.data.x))
    .then(() => pirror.server.setData({x: 42}))
    .then(waitUntil(()=> pirror.client.data.x === 42))
}, 2000)


