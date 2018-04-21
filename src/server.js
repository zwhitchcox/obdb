const body_parser = require('body-parser')
const fs = require('fs-extra')
const uuid = require('uuid/v4')
const store = {}

export default function attach({dir, app}) {
  app.use(body_parser.json())
  app.use(body_parser.text())
  app.post('/db/:field', (req, res) => {
    const id = uuid()
    const { field } = req.params
    store[field][id] = req.body
    write_data(dir, field)
      .then(() => res.end(id))
      .catch(() => res.status(500).end('Unable to write data - server error'))
  })
  app.get('/db/:field', (req, res) => {
    const { field } = req.params
    if (!store[field])
      get_data(dir, field)
        .then(data => res.end(JSON.stringify(store[field] = data)))
        .catch(console.error)
    else res.end(JSON.stringify(store[field]))
  })
  app.delete('/db/:field/:id', (req, res) => {
    const { field, id } = req.params
    if (store[field][req.params.id]) delete store[field][req.params.id]
    write_data(dir, field)
      .then(() => res.end(id))
      .catch(() => res.status(500).end('Unable to write data - server error'))
  })
  app.put('/db/:field/:id', (req, res) => {
    const { field, id } = req.params
    store[field][id] = req.body
    write_data(dir, field)
      .then(() => res.end(id))
      .catch(() => res.status(500).end('Unable to write data - server error'))
  })
}

export function get_data(dir, field) {
  const path = dir + '/' + field + '.json'
  return fs.readJson(path)
    .catch(err => {
      if (err.code ===  'ENOENT')
        fs.writeJson(path, {})
      return {}
    })
}

export function write_data(dir, field) {
  const path = dir + '/' + field + '.json'
  return fs.ensureFile(path)
    .then(() => fs.writeJson(path, store[field]))
}

