'use strict';

const path  = require('path');
const log   = require('debug')('notes:router-users');
const error = require('debug')('notes:error');
const express  = require('express');
const router   = express.Router();
exports.router = router;
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const usersModel = require(process.env.USERS_MODEL
        ? path.join('..', process.env.USERS_MODEL)
        : '../models/users-rest');

exports.initPassport = function(app) {
  app.use(passport.initialize());
  app.use(passport.session());
};

exports.ensureAuthenticated = function(req, res, next) {
  // req.user is set by Passport in the deserialize function
  if (req.user) next();
  else res.redirect('/users/login');
};

passport.use(new LocalStrategy(
  function(username, password, done) {
    console.log('usersModel', usersModel)
    usersModel.userPasswordCheck(username, password)
    .then(check => {
      if (check.check) {
        done(null, { id: check.username,
                     username: check.username });
      } else {
        done(null, false, check.message);
      }
      return check;
    })
    .catch(err => done(err));
  }
));

passport.use(new TwitterStrategy({
    consumerKey: process.env.NoteAppKey,
    consumerSecret: process.env.NoteAppSecret,
    callbackURL: "http://gtjiang.local:3000/users/auth/twitter/callback"
  },
  function(token, tokenSecret, profile, done) {
    usersModel.findOrCreate({
      id: profile.username, username: profile.username, password: "", provider: profile.provider, familyName: profile.displayName, givenName: "", middleName: "", photos: profile.photos, emails: profile.emails
    })
    .then(user => done(null, user))
    .catch(err => done(err));
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.username);
});

passport.deserializeUser(function(username, done) {
  usersModel.find(username)
  .then(user => done(null, user))
  .catch(err => done(err));
});


/*
**  Login & Logout
*/

router.get('/login', function(req, res, next) {
  // log(util.inspect(req));
  res.render('login', {
    title: "Login to Notes",
    user: req.user,
  });
});

router.post('/login',
  passport.authenticate('local', {
    successRedirect: '/',     // SUCCESS: Go to home page
    failureRedirect: 'login', // FAIL: Go to /user/login
  })
);

router.get('/logout', function(req, res, next) {
  req.logout();
  res.redirect('/');
});

// Twitter
// Routing
router.get('/auth/twitter', passport.authenticate('twitter'));

// Authenticate
router.get('/auth/twitter/callback',
  passport.authenticate('twitter', { successRedirect: '/',
                       failureRedirect: '/users/login' }));
