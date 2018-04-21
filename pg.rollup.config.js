import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import uglify from 'rollup-plugin-uglify'
import json from 'rollup-plugin-json'
import globals from 'rollup-plugin-node-globals'
import replace from 'rollup-plugin-replace'
import babel from 'rollup-plugin-babel'
import css from 'rollup-plugin-css-porter'
import path from 'path'

const production = !process.env.ROLLUP_WATCH;

const proj_root = __dirname

export default [
  {
    input: 'playground/client.js',
      output: {
        file: 'build/playground/public/client.js',
          format: 'umd',
          name: 'obdb_playground', sourcemap: true
      },
      plugins: [
        json(),
        css({dest: proj_root + '/build/playground/public/style.css'}),
        resolve({browser: true}),
        commonjs({
          include: 'node_modules/**',
          namedExports: {
            react: [ 'Component', 'Children', 'createElement' ],
            'react-dom': ['findDOMNode', 'unstable_batchedUpdates']
          }
        }),
        babel(),
        replace({
          'process.env.NODE_ENV': false,
        })
      ]
  },
  {
    input: 'playground/server.js',
    output: {
      file: 'build/playground/server.js',
      format: 'iife',
      sourcemap: true
    },
    plugins: [
      json(),
      resolve(),
      commonjs({include: 'node_modules/**'}),
      globals(),
    ]
  },
]


