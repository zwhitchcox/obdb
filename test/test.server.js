const httpProxy = require('http-proxy')
const PORT = 8080
const server = require('http').createServer(handler)
const proxy = httpProxy.createProxyServer({});
import {attach} from '../server'
attach({ server })
server.listen(PORT, _ => process.stdout.write(`App is listening on port ${PORT}`))

function handler (req, res) {
  proxy.web(req, res, { target: 'http://localhost:8089' })
}

