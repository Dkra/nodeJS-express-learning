'use strict'
var express = require('express');
var router = express.Router();
var notes = require('../models/notes-memory')

router.get('/', function(req, res, next) {
  notes.keylist()
    .then(keylist => {
      const keyPromises = []

      for (let key of keylist) {
        keyPromises.push(
          notes.read(key)
            .then(note => {
              return {
                key: note.key,
                title: note.title,
                body: note.body
              }
            })
        );
      }

      return Promise.all(keyPromises)
    })
    .then(notelist => {
      res.render('index', { title: 'Notes', notelist})
    })
    .catch(err => next(err))
});

module.exports = router;
