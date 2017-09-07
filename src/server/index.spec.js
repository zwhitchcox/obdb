import {  objToGraph, objFromGraph, Obdb, getPathIdsWithCreation } from '.'
import expect from 'expect'
import global from '../global'
const { keys } = Object

const graph = {
  '2': { is: 'up', going: 'on', the: { '#': 3 }, recursive: { '#': 2 } },
  '3': { everloving: 'fudge' },
  hello: { what: { '#': 2 } },
  extra: { extra: 'extra' }
}

let obdb;
function reset() {obdb = new Obdb(JSON.parse(JSON.stringify(graph)))}
reset()

describe('basic', () => {
  beforeEach(reset)
  it.only('should create graph', () => {
    const what = {
      is: 'up',
      going: 'on',
      the: {
        everloving: 'fudge'
      },
    }
    what.recursive = what
    const data = {
      hello: { what },
      extra: {extra: 'extra'},
    }
    const result = objToGraph(data)
    console.log('result', result)
    for (var x in p) {
      console.log()
    }
    //expect(result).toEqual(graph)
  })

  it('should return the correct id', () => {
    expect(obdb.getPathId('hello.what')).toEqual(2)
    expect(obdb.getPathId('hello')).toEqual(1)
    expect(obdb.getPathId('hello.what.the')).toEqual(3)
  })

  it('should automatically create objects for missing paths', () => {
    const prevGlobalId = global.id
    global.id = 1337
    const ids = getPathIdsWithCreation('hello.this.does.not.exist', obdb.graph)
    console.log(ids)
  })

  it('should retrieve all subrecords at path', () => {
    const id = obdb.getPathId('hello.what')
    expect(keys(obdb.getSubRecordIds(id))).toEqual(['2', '3'])
  })

  it('should create cache for all retrieved subrecords at path', () => {
    const graph = {
      '1': { what: { '#': 2 } },
      '2': { is: 'up', going: 'on', the: { '#': 3 }, recursive: { '#': 2 } },
      '3': { everloving: 'fudge' },
      '4': { extra: 'extra' },
      hello: { '#': 1 },
      extra: { '#': 4 }
    }
    const id = obdb.getPathIds('hello.what', graph)
    console.log(id)
    //expect(keys(obdb.getSubRecordIds(id, graph))).toEqual(['2', '3'])
  })

  it('should retrieve object', () => {
    const result = objFromGraph('hello.what', obdb.graph)
    expect(result)
      .toMatch({
        is: 'up',
        going:'on',
        the: {
          everloving: 'fudge',
        },
      })
    expect(result).toBe(result.recursive)
  })

  it('should change graph', () => {
    obdb.setIdVal('1', 'hello')
    expect(obdb.graph[1]).toBe('hello')
    reset()
    obdb.setIdKeyVal('1', 'what', 'hello')
    expect(obdb.graph[1].what).toBe('hello')
  })

  it('should subscribe to changes', () => {
    let counter = 0
    const expectations = [
      { '2': true, '3': true },
      { '2': true, '3': true, '10': true },
      { '2': true, '3': true, '10': true, '4': true },
    ]
    obdb.subscribe('hello.what', arg => {
      expect(arg).toEqual(expectations[counter++])
    })
    obdb.setIdKeyVal('2', 'what', {'#': '10'})
    obdb.setIdVal('hello', {'#': 4})
  })
})

function mkObj(listOfKeys) {
  const newObj = {}
  listOfKeys.forEach(key => newObj[key] = true)
  return newObj
}
