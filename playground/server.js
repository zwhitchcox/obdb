import {Reflex} from '..'
require('source-map-support').install()
const url = require('url')
const WS = require('ws')
const express = require('express')

const app = express()
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(express.static(__dirname))
app.get('/ready', (req, res) => res.end('true'))

const server = app.listen(3000, () => console.log('app is listening http://localhost:3000'))
const reflex = new Reflex({server})
