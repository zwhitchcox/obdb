import db from '../src/server'

const express = require('express')
const path = require('path')

const app = express()

db({
  app,
  dir: __dirname + '/data',
})
app.use(express.static(path.resolve(__dirname, '../build/playground/public')))
app.use(express.static(__dirname + '/static'))
app.use((req, res) => res.sendFile(__dirname + '/static/index.html'))

app.listen(3000, () => console.log('Listening on 3000'))
