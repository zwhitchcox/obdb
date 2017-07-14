import Obdb from './obdb'
import * as expect from 'expect'
import sinon from 'sinon'
const obdb = new Obdb
const {
  mkob,
  aur,
} = obdb;

it('should work with observers', () => {
  const ob = { hello: 'hi' }
  let x;
  mkob(ob)
  const destroyerOfWorlds = aur(() => x = ob.hello)
  expect(x).toBe('hi')
  ob.hello = 'no'
  expect(x).toBe('no')
  destroyerOfWorlds()
  ob.hello = 'yes'
  expect(x).toBe('no')
})

it('should mirror on database', () => {
})
