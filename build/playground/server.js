(function () {
  'use strict';

  var __dirname = '/home/zane/dev/obdb/playground'

  const body_parser = require('body-parser');
  const fs = require('fs-extra');
  const uuid = require('uuid/v4');
  const store = {};

  function attach({dir, app}) {
    app.use(body_parser.json());
    app.use(body_parser.text());
    app.post('/db/:field', (req, res) => {
      const id = uuid();
      const { field } = req.params;
      store[field][id] = req.body;
      write_data(dir, field)
        .then(() => res.end(id))
        .catch(() => res.status(500).end('Unable to write data - server error'));
    });
    app.get('/db/:field', (req, res) => {
      const { field } = req.params;
      if (!store[field])
        get_data(dir, field)
          .then(data => res.end(JSON.stringify(store[field] = data)))
          .catch(console.error);
      else res.end(JSON.stringify(store[field]));
    });
    app.delete('/db/:field/:id', (req, res) => {
      const { field, id } = req.params;
      if (store[field][req.params.id]) delete store[field][req.params.id];
      write_data(dir, field)
        .then(() => res.end(id))
        .catch(() => res.status(500).end('Unable to write data - server error'));
    });
    app.put('/db/:field/:id', (req, res) => {
      const { field, id } = req.params;
      store[field][id] = req.body;
      write_data(dir, field)
        .then(() => res.end(id))
        .catch(() => res.status(500).end('Unable to write data - server error'));
    });
  }

  function get_data(dir, field) {
    const path = dir + '/' + field + '.json';
    return fs.readJson(path)
      .catch(err => {
        if (err.code ===  'ENOENT')
          fs.writeJson(path, {});
        return {}
      })
  }

  function write_data(dir, field) {
    const path = dir + '/' + field + '.json';
    return fs.ensureFile(path)
      .then(() => fs.writeJson(path, store[field]))
  }

  const express = require('express');
  const path = require('path');

  const app = express();

  attach({
    app,
    dir: __dirname + '/data',
  });
  app.use(express.static(path.resolve(__dirname, '../build/playground/public')));
  app.use(express.static(__dirname + '/static'));
  app.use((req, res) => res.sendFile(__dirname + '/static/index.html'));

  app.listen(3000, () => console.log('Listening on 3000'));

}());
//# sourceMappingURL=server.js.map
