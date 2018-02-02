require('source-map-support').install()
import { createRequest, handleRequest, Pirror } from './pirror'

const pirror1 = Pirror({name: '1'})
const pirror2 = Pirror({name: '2'})
pirror1.broadcast = (...args) => pirror2.handleRequest(...args)
pirror2.broadcast = (...args) => pirror1.handleRequest(...args)

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
  pirror1.setData({hello: 'hi'})
  expect(pirror1.data.hello).toBe('hi')
  expect(pirror2.data.hello).toBe('hi')
})
