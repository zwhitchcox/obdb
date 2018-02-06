import  { Pirror, createRequest } from '../src/pirror'
const ws = new WebSocket(makews(window.location.host))

ws.onopen = () => {
  createPirror()
}
ws.onclose = () => {
  console.log('connection closed, waiting to reload')
  reloadwhenready()
}
function reloadwhenready() {
  fetch('http://localhost:3002/ready')
    .then(res=> res.text())
    .then(text => {
      if (text === 'false') reloadwhenready()
      else if (text === 'true') window.location.reload()
    })
    .catch(e => reloadwhenready())
}


function makews(str) {
  return 'ws://' + str.replace(/^https?:\/\//, '') + '/pirror'
}

function createPirror() {
  const pirror = new Pirror
  pirror.broadcast = data => {
    ws.send(type:'update', data)
  }
  ws.onmessage = event => {
    pirror.handleRequest(event.data)
  }
  runtests(pirror)
}

function runtests(pirror) {
  pirror.setData({hello: 'hi'})
}
function expectAll(data) {
  ws.send({type: 'expectall', data})
}
