import { Obdb } from './src/index'
import * as expect from 'expect'

it('should create new obdb without any peers', () => {
  const obdb = new Obdb
})

it('should create a new obdb with peers', () => {
  const peers = ['hello', 'darkness', 'my', 'old', 'friend']
  const obdb = new Obdb(peers)
  expect(obdb.peers).toEqual(peers)
})

describe('crud', () => {
  describe('primitive', () => {
    const obdb = new Obdb
    let key;

    it('should insert into database', () => {
      const testDatum = 'hello'
      key = obdb.mk(testDatum)
      expect(obdb.rd(key)).toEqual(testDatum)
    })

    it('should update data in database', () => {
      const testDatum = 'hell no'
      obdb.up(key, testDatum)
      expect(obdb.rd(key)).toEqual(testDatum)
    })

    it('should delete data from database', () => {
      obdb.rm(key)
      expect(obdb.rd(key)).toEqual(undefined)
    })
  )}
  describe('objects', () => {
    const obdb = new Obdb
    const testDatum = {
      hello: 'darkness',
      my: {
        old: 'friend'
      }
    }
    let key;

    it('should save objects', () => {
      key = obdb.mk(testDatum)
      expect(obdb.rd(key)).toEqual(testDatum)
    })
  })
})


