import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import uglify from 'rollup-plugin-uglify'
import json from 'rollup-plugin-json'
import globals from 'rollup-plugin-node-globals'
import replace from 'rollup-plugin-replace'
import babel from 'rollup-plugin-babel'
import css from 'rollup-plugin-css-porter'
import path from 'path'
import lib from './lib.rollup.config'
import pg from './pg.rollup.config'

const production = !process.env.ROLLUP_WATCH;

const proj_root = __dirname

export default lib.concat(pg)
