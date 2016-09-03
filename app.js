var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var FileStreamRotator = require('file-stream-rotator');
var routes = require('./routes/index');
var users = require('./routes/users');
var notes = require('./routes/notes');
var error = require('debug')('notes:error');

const session = require('express-session');
const FileStore = require('session-file-store')(session);

var accessLogStream;
if (process.env.REQUEST_LOG_FILE) {
    var logDirectory = path.dirname(process.env.REQUEST_LOG_FILE);
    fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
    accessLogStream = FileStreamRotator.getStream({
      filename: process.env.REQUEST_LOG_FILE,
      frequency: 'daily',
      verbose: false
    });
}
var app = express();
app.use(session({
  store: new FileStore({ path: "sessions" }),
  secret: 'keyboard mouse',resave: true,saveUninitialized: true}));
  
users.initPassport(app);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger(process.env.REQUEST_LOG_FORMAT || 'dev', {
    stream: accessLogStream ? accessLogStream : process.stdout
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/notes', notes)
app.use('/users', users.router);

// Vendors
app.use('/vendor/bootstrap', express.static(
  path.join(__dirname, 'node_modules', 'bootstrap', 'dist')));

app.use('/vendor/jquery', express.static(
  path.join(__dirname, 'node_modules', 'jquery', 'dist')));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
process.on('uncaughtException', function(err) {
  error("I've crashed!!! - "+ (err.stack || err));
});

if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    // util.log(err.message);
    res.status(err.status || 500);
    error((err.status || 500) +' '+ error.message);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

app.use(function(err, req, res, next) {
  // util.log(err.message);
  res.status(err.status || 500);
  error((err.status || 500) +' '+ error.message);
  res.render('error', {
    message: err.message,
    error: {}
  });
});



module.exports = app;
