import React from 'react'
import ReactDOM from 'react-dom'
import {observable} from 'mobx'
import {observer} from "mobx-react"

@observer export default class Home extends React.Component {

  render() {
    return <div>
      <h1>Home</h1>
    </div>
  }
}
