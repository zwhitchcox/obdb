const url = require('url')
const WS = require('ws')
const express = require('express')


const app = express()
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(express.static(__dirname))
app.get('/ready', (req, res) => res.end('true'))

const server = app.listen(3000, () => console.log('app is listening http://localhost:3000'))
const wss = new WS.Server({noServer: true})

server.on('upgrade', (req, socket, head) => {
  const pathname = url.parse(req.url, true)
  if (pathname.href === '/pirror') {
    wss.handleUpgrade(req, socket, head, ws => {
      ws.on('message', message => {
        console.log('received %s', message)
      })
      ws.send('something 19')
    })
  }
})
