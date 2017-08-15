import { subscribe, getPathId, getSubRecordIds, cache } from '.'
import expect from 'expect'

const sampleData = {
  hello: {what: {'#': 35 }},
  35: {
    is: 'up',
    going: 'on',
    the: {'#': 37},
  },
  37: {everloving: {'#': 38}},
  38: 'fudge'
}


it('should properly return the correct id', () => {
  expect(getPathId('hello.what', sampleData)).toEqual(35)
  expect(getPathId('hello', sampleData)).toEqual('hello')
  expect(getPathId('hello.what.the.everloving', sampleData)).toEqual(38)
})

it('should properly retrieve all subrecords at path', () => {
  const id = getPathId('hello.what', sampleData)
  expect(getSubRecordIds(id, sampleData)).toEqual(mkObj([37, 38]))
})

it('should properly retrieve all recursive subrecords at path', () => {
  const recursiveSampleData = JSON.parse(JSON.stringify(sampleData))
  const id = getPathId('hello.what', recursiveSampleData)
  recursiveSampleData[35].going = {'#': 35}
  expect(getSubRecordIds(id, recursiveSampleData, {})).toEqual(mkObj([35, 37, 38]))
})

it('should create a cache for all subrecords', () => {
  const recursiveSampleData = JSON.parse(JSON.stringify(sampleData))
  const id = getPathId('hello.what', recursiveSampleData)
  recursiveSampleData[35].going = {'#': 35}
  expect(getSubRecordIds(id, recursiveSampleData, {})).toEqual(mkObj([35, 37, 38]))
  expect(cache[35]).toEqual(mkObj([35, 37, 38]))
})

it.skip('should properly retrieve object', () => {
  expect(subscribe('hello.what', sampleData))
    .toEqual({
      is: 'up',
      going:'on',
      the: {
        everloving: 'fudge',
      },
    })
})

function mkObj(listOfKeys) {
  const newObj = {}
  listOfKeys.forEach(key => newObj[key] = true)
  return newObj
}
