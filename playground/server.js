import { Obdb } from '../src/server'

const express = require('express')
const path = require('path')

const app = express()

app.use(express.static(path.resolve(__dirname, '../build/playground/public')))
app.use(express.static(__dirname + '/static'))
app.use((req, res) => res.sendFile(__dirname + '/static/index.html'))

const server = app.listen(3000, () => console.log('Listening on 3000'))
const obdb = new Obdb({
  server,
  dir: __dirname + '/data',
})
