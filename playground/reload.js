const ws = new WebSocket('ws://localhost:3002')
ws.onmessage = function(msg) {
  if (msg.data === 'refresh') {
    location.reload()
  }
}

