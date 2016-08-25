'use strict'
var express = require('express');
var router = express.Router();
var path  = require('path');
var notes = require(process.env.NOTES_MODEL
                  ? path.join('..', process.env.NOTES_MODEL)
                  : '../models/notes-memory');

router.get('/', function(req, res, next) {
  notes.keylist()
    .then(keylist => {
      const keyPromises = []
      console.log('keylist', keylist);
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
      console.log('keyPromises', keyPromises);
      return Promise.all(keyPromises)
    })
    .then(notelist => {
      console.log('notelist', notelist);
      res.render('index', { title: 'Notes', notelist})
    })
    .catch(err => next(err))
});

module.exports = router;
