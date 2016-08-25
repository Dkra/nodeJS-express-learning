'use strict'

var util = require('util');
var express = require('express');
var router = express.Router();
var path  = require('path');
var notes = require(process.env.NOTES_MODEL
                  ? path.join('..', process.env.NOTES_MODEL)
                  : '../models/notes-memory');

// Create
router.get('/add', (req, res, next) => {
  // string will be template's filename
  res.render('noteedit', {
    title: 'Add a Note',
    docreate: true,
    notekey: '',
    note: null
  })
})

// Read
router.get('/view', (req, res, next) => {
  notes.read(req.query.key)
    .then(note => {
      res.render('noteview', {
        title: note ? note.title : '',
        notekey: req.query.key,
        note: note
      })
    })
    .catch(err => { next(err)})
})

// Edit
router.get('/edit', (req, res, next) => {
  notes.read(req.query.key)
    .then(note => {
      res.render('noteedit', {
        title: note ? ('Edit' + note.title) : '',
        docreate: false,
        notekey: req.query.key,
        note: note
      })
    })
    .catch(err => { next(err)})
})

// Update
router.put('/update', (req, res, next) => {
  notes.update(req.query.key, req.query.title, req.query.body)
    .then(note => {
      res.redirect(`/notes/view/?key=${req.query.key}`)
    })
    .catch(err => { next(err)})
})

// Save
router.post('/save', (req, res, next) => {
  var p; // p will assign promise later on

  console.log('reqbody', req.body);
  if (req.body.docreate === 'true') {
    p = notes.create(req.body.notekey, req.body.title, req.body.body)
    console.log('creating!!!!!!!!!!!!!!!');
  } else {
    p = notes.update(req.body.notekey, req.body.title, req.body.body)
    console.log('updating!!!!!!!!!!!!!');
  }
  p.then(note => {
    console.log('note', note);

    res.redirect('/')
  })
  .catch(err => {next(err)})
})

// Delete Note
router.get('/destroy', (req, res, next) => {
  notes.read(req.query.key)
    .then(note => {
      res.render('notedestroy', {
        title: note ? note.title : "",
        notekey: req.query.key,
        note: note
      })
    })
    .catch(err => {next(err)})
})

router.post('/destroy/confirm', (req, res, next) => {
  notes.destroy(req.body.notekey)
    .then(() => {
      res.redirect('/')
    })
    .catch(err => {next(err)})
})

module.exports = router;
