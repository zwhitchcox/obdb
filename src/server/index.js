const connections = []

export function attach({server, filePath}) {
  var io = require('socket.io')(server, { path: '/obdb' })
  io.on('connection', socket => {
  })
}


