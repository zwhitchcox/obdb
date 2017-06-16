const httpProxy = require('http-proxy')
const PORT = 8080
var app = require('http').createServer(handler)
var io = require('socket.io')(app)
var proxy = httpProxy.createProxyServer({});
import {attach} from './server'
console.log(attach)

app.listen(PORT, _ => process.stdout.write(`App is listening on port ${PORT}`))

function handler (req, res) {
  proxy.web(req, res, { target: 'http://localhost:8089' })
}

io.on('connection', (socket) => {
  socket.emit('update', { hello: 'suck it' });
  socket.on('my other event', (data) => {
    socket.emit('update', { hello: 'suck it' });
  })
})
