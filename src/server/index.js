const data = {}
const connections = []

export function attach({server, filePath}) {
  var io = require('socket.io')(server, { resource: '/obdb'})
  io.on('connection', socket => {
    connections.push(socket)
    const connIdx = connections.length
    socket.on('update', ({o, k}) => {
      for (key in obj) {
        data[key] = obj[key]
      }
      connections.forEach((conn, i) => /*i !== connIdx &&*/ conn.emit('update', obj))
      connections[connIdx].emit('saved', k)
    })
    socket.on('replace', ({k, d}) => {
      data[k] = d
      connections.forEach((conn, i) => /*i !== connIdx &&*/ conn.emit('replace', {k, d}))
      connections[connIdx].emit('saved', k)
    })
  })
}


