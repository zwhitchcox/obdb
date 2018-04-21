import React from 'react'
import ReactDOM from 'react-dom'
import { observable, toJS } from 'mobx'
import { observer } from 'mobx-react'
import { Paper, TextField, RaisedButton, DropDownMenu, MenuItem } from 'material-ui'
import { store } from './store'

@observer export default class Quiz extends React.Component {
  @observable chapter
  @observable cur_idx
  @observable cur_qas
  @observable msg = ""
  @observable answer = ""
  
  submit(e) {
    e.preventDefault()
    const cur_qa = this.cur_qas[this.cur_idx]
    if (cur_qa.answer.toLowerCase()=== this.answer.toLowerCase()) {
      this.msg = "Correct!"
      this.cur_qas.splice(this.cur_idx, 1)
      this.answer = ""
    } else {
      this.msg = "Incorrect! " + this.answer
    }
    this.cur_idx = Math.random() * this.cur_qas.length | 0
  }

  chapter_select(value) {
    this.chapter = value
    this.cur_qas = store
      .questions
      .filter(qa => qa.chapter === this.chapter)
    this.cur_idx = Math.random() * this.cur_qas.length | 0
  }

  componentWillMount() {
    store.subscribe(['questions', 'chapters'])
  }

  render() {
    const cur_qa = this.cur_qas && this.cur_qas.length && this.cur_qas[this.cur_idx]
    return <div>
      <DropDownMenu onChange={(e, i, value) => this.chapter_select(value)} value={this.chapter || ""}>
        {store.chapters.map((ch, i) => <MenuItem value={ch} primaryText={ch} key={i} />)}
      </DropDownMenu>
      <div>
        <div>{this.msg}</div>
        {this.cur_qas && !this.cur_qas.length ? <div>Done!</div> : ""}
        {cur_qa && cur_qa.question}
      </div>
      <form onSubmit={e => this.submit(e)}>
        <TextField value={this.answer} onChange={e => this.answer = e.target.value} floatingLabelText="Answer"/>
      </form>
    </div>
  }
}
