import './setup.client'
import './style.css'
import React from 'react'
import ReactDOM from 'react-dom'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table'
import { Paper, TextField, RaisedButton, DropDownMenu, MenuItem } from 'material-ui'
import { store } from '../src/client'
import { observer } from '../src/observer'
import { observable } from '../src/observable'


const get_blank_person = () => ({
  name: "",
  age: "",
  race: "",
})
@observer export default class App extends React.Component {
  @observable new_person = get_blank_person()
  @observable people = []
  componentWillMount() {
    //store.subscribe('people', [])
  }
  add_person = e => {
    e.preventDefault()
    this.people.push(this.new_person)
    this.new_person = get_blank_person()
  }
  render() {
    return <MuiThemeProvider>
      <div>
        {this.new_person.name}
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
              <TableHeaderColumn>
                Delete
              </TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody displayRowCheckbox={false}>
            {this.people.map((person, i) => <TableRow key={i} selectable={false}>
              <TableRowColumn>
                <TextField onChange={e => (person.name = e.target.value)} name="Name" value={person.name} fullWidth={true} />
              </TableRowColumn>
              <TableRowColumn>{person.age}</TableRowColumn>
              <TableRowColumn>{person.race}</TableRowColumn>
              <TableRowColumn>
                <RaisedButton onClick={() =>this.people.splice(i, 1)}>Delete</RaisedButton>
              </TableRowColumn>
          </TableRow>)}
        </TableBody>
      </Table>
    </div>
  </MuiThemeProvider>
  }
}

ReactDOM.render(<App />, document.querySelector('app'))

