import  { Reflex } from '..'
const ws = new WebSocket(makews(window.location.host))

ws.onopen = () => {
  createReflex()
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
  return 'ws://' + str.replace(/^https?:\/\//, '') + '/reflex'
}

function createReflex() {
  const reflex = new Reflex
  reflex.broadcast = data => {
    ws.send(type:'update', data)
  }
  ws.onmessage = event => {
    reflex.handleRequest(event.data)
  }
  runtests(reflex)
}

function runtests(reflex) {
  reflex.setData({hello: 'hi'})
}
function expectAll(data) {
  ws.send({type: 'expectall', data})
}
