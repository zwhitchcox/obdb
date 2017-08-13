import Obdb from './obdb'
import * as expect from 'expect'
import sinon from 'sinon'
import { autorun, observable } from './obdb'

autorun(async () => {
  const b = await observable('hello.what')
  console.log('b', b)
  console.log(b.is)
})
