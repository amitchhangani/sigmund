var express = require('express');
var cors = require('cors');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var debug = require('debug')('signora:server');

//var port = normalizePort(process.env.PORT || '4101');
var port = normalizePort('4101');
var app = express();
var http = require('https');
//var http = require('http');

var privateKey  = fs.readFileSync('./certs/stagingsdei_com.key', 'utf8');
var certificate = fs.readFileSync('./certs/c86aaff33f318ca4.crt', 'utf8');
var ca = fs.readFileSync('./certs/gd_bundle-g2-g1.crt');
var httpsOptions = {key: privateKey, cert: certificate, ca: ca};


//var server = http.createServer(app);
var server = http.createServer(httpsOptions,app);


// sign with RSA SHA256
//var cert = fs.readFileSync('private.key');  // get private key
//var token = jwt.sign({ foo: 'bar' }, cert, { algorithm: 'RS256'});

// sign asynchronously
//jwt.sign({ foo: 'bar' }, cert, { algorithm: 'RS256' }, function(err, token) {
//console.log(token);
//});
var transcriptions = require('./routes/transcriptions');
var recommendations = require('./routes/recommendations');
var users = require('./routes/users');

//var app = express();


mongoose.connect('mongodb://testrnd:testrnd2780@localhost/testrnd');
//mongoose.connect('mongodb://localhost/sigmund');
var Schema = mongoose.Schema;
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

const corsOptions = {
  'origin': 'https://stagingsdei.com',
  //'origin': 'http://localhost:4200',
  'methods': ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  'credentials': true,
  'allowedHeaders': ['Content-Type', 'Authorization'],
  'preflightContinue': false,
  'optionsSuccessStatus': 204
}

app.use(cors(corsOptions))
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var callSocket = function (req, res, next) {
  io.sockets.emit("test", "testing");
  next()
}


app.use('/user', users)
app.use('/recommendations', recommendations)
app.use('/transcriptions', callSocket, transcriptions)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.set('port', port);
console.log("port", port)

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
var io = require('socket.io')(server);

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  console.log("listenning")
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('Listening on ' + bind);
}


 process.on('watson', function(obj) {;
    io.sockets.emit("transcript", obj);
 })
 process.on('tone', function(arr){
    io.sockets.emit("tone",arr); 
 })
 process.on('recommendations',function(arr){
    io.sockets.emit("recommendations",arr)
 })
 process.on('danger',function(arr){
    io.sockets.emit("danger",arr)
 })
 process.on('sentiment',function(arr){
    io.sockets.emit("sentiment",arr)
 })
