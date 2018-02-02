export function createRequest(request) {
  return JSON.stringify(request)
}

export function handleRequest(request, data) {
  const parsed = JSON.parse(request)
  Object.assign(data, JSON.parse(request))
}

export function Pirror() {
  return {
    peers: [],
    broadcast: () => {},
    data: {},
    handleRequest: function (request) {
      handleRequest(request, this.data)
    },
    createRequest,
  }
}
