require('source-map-support').install()
import { createRequest, handleRequest, Pirror } from './pirror'

const pirror1 = Pirror()
const pirror2 = Pirror()
pirror1.broadcast = pirror2.handleRequest
pirror2.broadcast = pirror1.handleRequest
test('createRequest', () => {
  const obj = {b: 'yolo'}
  const request = createRequest(obj)
  expect(request).toBe(JSON.stringify(obj))
})

test('handleRequest', () => {
  const data = {}
  handleRequest(JSON.stringify({
    a:1
  }), data)
  expect(data['a']).toBe(1)
})

test('create and handle requests', () => {
  const newdata = {mylittlepony: 'the coolest pony in the world'}
  handleRequest(createRequest(newdata))
  expect(data.mylittlepony).toBe(newdata.mylittlepony)
})
