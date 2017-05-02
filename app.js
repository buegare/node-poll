const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const expressValidator = require('express-validator');
const logger = require('morgan');
const bodyParser = require('body-parser');
const config = require('./config/server.js');
const path = require('path');

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// configure Express  
app.use(cookieParser('blablabla'));
// Handle Express Sessions
app.use(session({ 
  secret: 'secret', 
  saveUninitialized: true, 
  resave: true, 
  cookie: { maxAge: 3600000 }}));

app.set('views', path.join(__dirname, 'views'));

// view engine setup
app.set('view engine', 'pug');

// Enable server to log requests
app.use(logger('common'));

//Validator
app.use(expressValidator({
  errorFormatter: (param, msg, value) => {
      let namespace = param.split('.');
      let root = namespace.shift();
      let formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

app.get('/', (req, res) => {
	res.render('index');
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(config.server.port, () => console.log(`Server started on port ${config.server.port}...`));