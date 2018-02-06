import { Pirror as PirrorServer } from './server.pirror'
import { Pirror as PirrorClient } from './client.pirror'
const PORT = 4001
const express = require('express')
const app = express()
const pirror = {}

let client1, client2;
beforeAll(done => {
  const server = app.listen(PORT, () => {
    pirror.server = new PirrorServer({server})                                      
    pirror.client1 = new PirrorClient({peerurls: [`ws://localhost:${PORT}/pirror`]})
    pirror.client2 = new PirrorClient({peerurls: [`ws://localhost:${PORT}/pirror`]})
    client1 = pirror.client1
    client2 = pirror.client2
    pirror.server.name = 'pirror.server'
    pirror.client1.name = 'pirror.client1'
    pirror.client2.name = 'pirror.client2'

    done()
  })
})


test('propagates to both clients', async () => {
  const update1 = {clienthello1: 'hi1'}
  const update2 = {clienthello2: 'hi2'}
  await client1.setData(update1)
  await client2.setData(update2)

  return waitUntil(() => checkData(client1, update2) && checkData(client2, update1))
    .then(() => log('client1\n', client1, 'client2\n', client2))
}, 2000)
