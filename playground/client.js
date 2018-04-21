import './setup.client'
import './style.css'
import React from 'react'
import ReactDOM from 'react-dom'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import { routes } from './routes'
import { store } from '../src/client'
import { observer } from 'mobx-react'

@observer export default class App extends React.Component {
  render() {
    return <MuiThemeProvider>
      {React.createElement(routes[store.route])}
    </MuiThemeProvider>
  }
}

ReactDOM.render(<App />, document.querySelector('app'))

