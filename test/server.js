const express = require('express')
const WS = require('ws')
const app = express()

app.use(express.static(__dirname))

const server = app.listen(3000, () => console.log('app is listening http://localhost:3000'))
const wss = new WS.Server({server})

wss.on('connection', (ws, req) => {

  ws.on('message', message => {
    console.log('rec eived %s', message)
  })
  ws.send('something')
})
