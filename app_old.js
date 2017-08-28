var express = require('express');
var cors = require('cors');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');


// sign with RSA SHA256 
//var cert = fs.readFileSync('private.key');  // get private key 
//var token = jwt.sign({ foo: 'bar' }, cert, { algorithm: 'RS256'});
 
// sign asynchronously 
//jwt.sign({ foo: 'bar' }, cert, { algorithm: 'RS256' }, function(err, token) {
  //console.log(token);
//});

var recommendations = require('./routes/recommendations');
var users = require('./routes/users');

var app = express();
mongoose.connect('mongodb://testrnd:testrnd2780@localhost/testrnd');
//mongoose.connect('mongodb://localhost/sigmund');
var Schema = mongoose.Schema;
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(cors());
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/user',users)
app.use('/recommendations',recommendations)
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});





app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
