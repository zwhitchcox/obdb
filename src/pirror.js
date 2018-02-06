export function createRequest(request) {
  return JSON.stringify(request)
}

export function handleUpdate(update) {
  log('data before', this.name, this.data)
  log('update', update)
  Object.assign(this.data, update)
  log('data after', this.name, this.data)
}

export class PirrorMain {
  constructor({name} = {}) {
    this.name = name
  }
  peers = []
  data = {}
  handleMessage(msg) {
    const parsed = JSON.parse(msg)
    if (parsed.type === 'update') {
      handleUpdate.call(this, parsed.data)
    }
  }
  createRequest
  setData(obj) {
    const p = this
    for (const key in obj) {
      let val;
      if (!(key in this.data)) {
        Object.defineProperty(this.data, key, {
          set(newVal) {
            if (val !== newVal) {
              val = newVal
              p.broadcast(createRequest({
                data: {[key]: newVal},
                type: 'update',
              }))
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
