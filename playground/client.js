import  { Reflex } from '..'
import uuid from 'uuid/v4'
import './reload'

import React, {Component} from 'react'
import ReactDOM from 'react-dom'

const reflex = new Reflex
reflex.on('update', render)



class Hello extends Component {
  handleChange(change) {
    this.newVal = change
  }
  handleClick() {
    this.update()
  }
  handleKeyPress(e) {
    if (e.key === 'Enter') {
      this.update()
    }
  }
  update() {
    reflex.update({hello: this.newVal})
  }

  render() {
    return <div>
      {reflex.data.hello}
      <br /><br />
      <input onKeyUp={e => this.handleKeyPress(e)} onChange={e =>this.handleChange(e.target.value)} />
      <br />
      <br />
      <button onClick={()=>this.handleClick()}>update</button>
    </div>
  }
}
render()

function render() {
  ReactDOM.render(<Hello />, document.querySelector('#app'))
}
