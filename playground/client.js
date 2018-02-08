import  { Reflex } from '..'
import uuid from 'uuid/v4'
import './reload'
import { observable, extendObservable, autorun } from 'mobx'
import { observer } from 'mobx-react'

import React, {Component} from 'react'
import ReactDOM from 'react-dom'

const reflex = new Reflex
const store = observable.map({})
store.set('val', 'hello')

reflex.on('update', data => {
  for (const key in data) {
    store.set(key, data[key])
  }
})
autorun(() => {
  store.forEach((val, key) => reflex.update({[key]: val})) 
})

@observer
class Hello extends Component {
  render() {
    const {store} = this.props
    console.log('render', store.values())
    return <div>
      {store.get('val')}
      <br /><br />
      <input value={store.get('val')} onChange={e => store.set('val', e.target.value)} />
    </div>
  }
}

ReactDOM.render(<Hello store={store} />, document.querySelector('#app'))
