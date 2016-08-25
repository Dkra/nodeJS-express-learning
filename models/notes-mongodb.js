'use strict';

const util        = require('util');
const mongodb     = require("mongodb");
const MongoClient = require('mongodb').MongoClient;
const log         = require('debug')('notes:mongodb-model');
const error       = require('debug')('notes:error');
const Note        = require('./Note');

var db;

exports.connectDB = function() {
  return new Promise((resolve, reject) => {
    if (db) return resolve(db)

    // Connection URL
    var url = process.env.MONGO_URL

    // Use connect method to connect to server
    MongoClient.connect(url, (err, _db) => {
      if (err) return reject(err)
      db = _db
      resolve(_db)
    })
  })
}

exports.create = function(key, title, body) {
  return exports.connectDB()
    .then(db => {
      console.log('create, success connect to db');
      var note = new Note(key, title, body)
      var collection = db.collection('notes')
      // console.log('collection', collection);
      return collection.insertOne({
        notekey: key,
        title,
        body
      }).then(result => {return note})
    })
}

exports.update = function(key, title, body) {
  return exports.connectDB()
    .then(db => {
      var note = new Note(key, title, body)
      var collection = db.collection('notes')

      return collection.updateOne({
        notekey: key
      },{
        $set: {
          title,
          body
        }
      }).then(result => note)
    })

}

exports.read = function(key) {
  return exports.connectDB()
    .then(db => {
      var collection = db.collection('notes')

      // find some documents
      return collection.findOne({ notekey: key})
        .then(doc => {
          var note = new Note(doc.notekey, doc.title, doc.body)
          return note
        })
    })
}

exports.destroy = function(key) {
    return exports.connectDB()
    .then(db => {
        var collection = db.collection('notes')
        return collection.findOneAndDelete({ notekey: key })
    })
}

exports.keylist = function() {
    return exports.connectDB()
    .then(db => {
        var collection = db.collection('notes');
        console.log('collection', collection);
        return new Promise((resolve, reject) => {
            var keyz = [];
            collection.find({}).forEach(
                note => { keyz.push(note.notekey); },
                err  => {
                    if (err) reject(err);
                    else resolve(keyz);
                }
            );
        });
    });
};

exports.count = function() {
    return exports.connectDB()
    .then(db => {
        var collection = db.collection('notes')
        return new Promise((resolve, reject) => {
            collection.count({}, (err, count) => {
                if (err) reject(err)
                else resolve(count)
            })
        })
    })
}
