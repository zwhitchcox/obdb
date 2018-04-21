import React from 'react'
import ReactDOM from 'react-dom'
import {observable} from 'mobx'
import {observer} from 'mobx-react'
import createHistory from 'history/createBrowserHistory'
import {routes} from './routes'
import {store} from './store'

// TODO fix circular dependency
const history = createHistory()
const unlisten = history.listen((location, action) => {
  store.route = location.pathname
})
@observer export class Link extends React.Component {
  navigate(href) {
    history.push(href)
    store.route = href
  }
  render() {
    return <a className="link" onClick={()=> this.navigate(this.props.href)}>
      {this.props.children}
    </a>
  }
}

