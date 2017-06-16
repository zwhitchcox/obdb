import {
  set,
  startObservation,
  getObserved,
  endObservation,
  keys,
  observed,
} from './obdb'
import * as expect from 'expect'
import io from 'socket.io-client'
var socket = io('http://localhost:8080');

it('should set and get properties', () => {
  const obj = {}
  set(obj, 'hello', 'hi')
  expect(obj.hello).toEqual('hi')
})

it('should correctly identify observed properties primitives', () => {
  const obj = {}
  ;['hi', null, true, undefined, 3]
    .forEach((prim, i) => {
      startObservation()
      set(obj, ''+i, prim)
      expect(obj[''+i]).toEqual(prim)
      endObservation()
      expect(keys[getObserved()[0]]).toEqual(prim)
    })
})

it('should communicate with the server', done => {
  socket.on('update', update);
  function update (data) {
    console.log('hello')
    expect(data).toEqual({ hello: 'suck it' })
    socket.removeListener('update', update)
    done()
  }
})
