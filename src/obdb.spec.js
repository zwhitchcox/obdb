import Obdb from './obdb'
import * as expect from 'expect'
const obdb1 = new Obdb(window.location.href, { path: '/obdb' })
const obdb2 = new Obdb(window.location.href, { path: '/obdb' })

it('should set and get properties', () => {
  obdb1.update({hello: 'hi'})
  expect(obdb1.data.hello).toEqual('hi')
})

it.only('should emit saved and callback', done => {
  throw new Error('hello')
  obdb1.update({hello: 'hi'}, done)
})

it('should update the server', (done) => {
  setTimeout(()=>(expect(obdb2.data.hello).toEqual('hi'), done()), 100)
  
})

it('should communicate with the server', done => {
  done()
})
