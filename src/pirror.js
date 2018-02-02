export function createRequest(request) {
  return JSON.stringify(request)
}

export function handleRequest(request, data) {
  const parsed = JSON.parse(request)
  Object.assign(data, JSON.parse(request))
}

export function Pirror({name} = {}) {
  return {
    name,
    peers: [],
    broadcast: () => {},
    data: {},
    handleRequest (request) {
      console.log('handling', this.name)
      handleRequest(request, this.data)
    },
    createRequest,
    setData(obj) {
      const p = this
      for (const key in obj) {
        let val;
        if (!(key in this.data)) {
          Object.defineProperty(this.data, key, {
            set(newVal) {
              if (val !== newVal) {
                val = newVal
                console.log('broadcasting', p.name)
                p.broadcast(createRequest({[key]: newVal}))
              }
              return val
            },
            get() {
              return val
            },
            enumerable: true,
          })
        }
        this.data[key] = obj[key]
      }
    }
  }
}
