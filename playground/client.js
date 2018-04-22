import './setup.client'
import './style.css'
import React from 'react'
import ReactDOM from 'react-dom'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table'
import { Paper, TextField, RaisedButton, DropDownMenu, MenuItem } from 'material-ui'
import { store } from '../src/client'
import { observable, toJS } from 'mobx'
import { observer } from 'mobx-react'

const get_blank_person = () => ({
  name: "",
  age: "",
  race: "",
})
@observer export default class App extends React.Component {
  @observable new_person = get_blank_person()
  componentWillMount() {
    store.subscribe('people')
  }
  add_person = e => {
    e.preventDefault()
    store.people.push(this.new_person)
    this.new_person = get_blank_person()
  }
  render() {
    return <MuiThemeProvider>
      <div>
        <form onSubmit={this.add_person}>
          <TextField onChange={e => this.new_person.name = e.target.value} value={this.new_person.name} floatingLabelText="Name" fullWidth={true} /><br />
          <TextField onChange={e => this.new_person.age = e.target.value} value={this.new_person.age} floatingLabelText="Age" fullWidth={true} /><br />
          <TextField onChange={e => this.new_person.race = e.target.value} value={this.new_person.race} floatingLabelText="Race" fullWidth={true} /><br />
          <RaisedButton onClick={this.add_person}>Add</RaisedButton>
        </form>
        <Table>
          <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
            <TableRow>
              <TableHeaderColumn>
                Name
              </TableHeaderColumn>
              <TableHeaderColumn>
                Age
              </TableHeaderColumn>
              <TableHeaderColumn>
                Race
              </TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody displayRowCheckbox={false}>
            {store.people.map((person, i) => <TableRow key={i} selectable={false}>
              <TableRowColumn>
                <TextField onChange={e => person.name = e.target.value} name="Name" value={person.name} fullWidth={true} />
              </TableRowColumn>
              <TableRowColumn>{person.age}</TableRowColumn>
              <TableRowColumn>{person.race}</TableRowColumn>
          </TableRow>)}
        </TableBody>
      </Table>
    </div>
  </MuiThemeProvider>
  }
}

ReactDOM.render(<App />, document.querySelector('app'))

