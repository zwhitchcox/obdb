import {
  aur,
  mkob,
} from './obdb'
import * as expect from 'expect'
import sinon from 'sinon'

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
