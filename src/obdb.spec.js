import { Obdb } from './obdb'
import { getId } from './global'
import * as expect from 'expect'

it('should set and get value for property', () => {
  const obdb = new Obdb
  obdb.set('x', 'y')
  expect(obdb.get('x')).toEqual('y')
})

it('should set and get nested value for property', () => {
  const obdb = new Obdb
  obdb.set(['x', 'y'], 'z')
  expect(obdb.get(['x', 'y'])).toEqual('z')
  expect(obdb.data.x.y).toEqual('z')
})

it('should set and get nested value for property', () => {
  const obdb = new Obdb
  obdb.set(['x', 'y'], 'z')
  expect(obdb.get(['x', 'y'])).toEqual('z')
  expect(obdb.data.x.y).toEqual('z')
})
