import React from 'react'
import ReactDOM from 'react-dom'
import { observable, toJS } from 'mobx'
import {observer} from "mobx-react"
import { Paper, TextField, RaisedButton, DropDownMenu, MenuItem } from 'material-ui'
import { store } from './store'

const ppr_style = {
  margin: "2%",
  padding: "2%",
}
const sbmt_style = {
  margin: 12,
  padding: "2px 5px",
}

@observer export default class Edit extends React.Component {
  @observable qa = {
    question: "",
    answer: "",
    reference_1: "",
    reference_2: "",
    chapter: "",
  }
  @observable chapter = ""
  @observable editing_qa = false
  @observable editing_chapter = false
  @observable filter

  componentWillMount() {
    store.subscribe(['questions', 'chapters'])
  }

  edit_qa(i) {
    this.editing_qa = true
    this.qa = toJS(store.questions[i])
    this.edit_qa_i = i
  }

  submit_qa() {
    if (this.qa.chapter==="") return
    if (this.editing_qa) {
      store.questions[this.edit_qa_i] = this.qa
    } else {
      store.questions.push(this.qa)
    }
    this.editing_qa = false
    this.qa = {
      question: "",
      answer: "",
      reference_1: "IRC ",
      reference_2: "IBC ",
      chapter: this.qa.chapter,
    }
  }

  edit_chapter(i) {
    this.editing_chapter = true
    this.chapter = toJS(store.chapters[i])
    this.edit_chapter_i = i
  }

  submit_chapter() {
    if (this.editing_chapter) {
      store.chapters[this.edit_chapter_i] = this.chapter
    } else {
      store.chapters.push(this.chapter)
    }
  }

  render() {
    return <div>
      <h2 className="header">Add Question</h2>
      <Paper style={ppr_style} zDepth={2}>
        <form onSubmit={e => e.preventDefault() || this.submit_qa()}>
          <TextField onChange={e => this.qa.question = e.target.value} value={this.qa.question} floatingLabelText="Question" fullWidth={true} multiLine={true} rows={4} /><br />
          <TextField onChange={e => this.qa.answer = e.target.value} value={this.qa.answer} floatingLabelText="Answer" fullWidth={true}/><br />
          <TextField onChange={e => this.qa.reference_1 = e.target.value} value={this.qa.reference_1} floatingLabelText="Reference 1" fullWidth={true}/><br />
          <TextField onChange={e => this.qa.reference_2 = e.target.value} value={this.qa.reference_2} floatingLabelText="Reference 2" fullWidth={true}/><br />
          {this.answer}
          <DropDownMenu onChange={(e, i, value) => this.qa.chapter = value} value={this.qa.chapter || ""}>
            {store.chapters.map((ch, i) => <MenuItem value={ch} primaryText={ch} key={i} />)}
          </DropDownMenu>
          {JSON.stringify(this.qa)}
          <RaisedButton style={sbmt_style} onClick={() => this.submit_qa()}>
            {this.editing_qa ? 'Edit' : 'Add'} Question</RaisedButton>
        </form>
      </Paper>
        <DropDownMenu onChange={(e, i, value) => this.filter = value} value={this.filter || ""} required={true}>
        {store.chapters.map((ch, i) => <MenuItem value={ch} primaryText={ch} key={i} />)}
      </DropDownMenu>
      questions<br />
      <ul>
        {store.questions.filter(qa => !this.filter || qa.chapter === this.filter).map((q, i) => <li  key={i}>
          <span onClick={()=> this.edit_qa(store.questions.indexOf(q))}><pre>{JSON.stringify(q, true, 2)}</pre></span>
          <RaisedButton onClick={() => store.questions.splice(store.questions.indexOf(q), 1)}>X</RaisedButton>
      </li>)}
    </ul>
    <h2 className="header">Add Chapter</h2>
    <Paper style={ppr_style} zDepth={2}>
      <div>
        <TextField onChange={e => this.chapter = e.target.value} value={this.chapter} floatingLabelText="Chapter" fullWidth={true}/><br />
        {this.chapter}

        <RaisedButton style={sbmt_style} onClick={() => this.submit_chapter()}>
          {this.editing_chapter ? 'Edit' : 'Add'} Chapter</RaisedButton>
      </div>
    </Paper>
      chapters<br />
      <ul>
        {store.chapters.map((q, i) => <li  key={i}>
          <span onClick={()=> this.edit_chapter(i)}>{`${i}: ${JSON.stringify(q)}`}</span>
          <RaisedButton onClick={() => store.chapters.splice(i, 1)}>X</RaisedButton>
      </li>)}
    </ul>
  </div>
  }
}
