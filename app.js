var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var docRouter = require('./routes/documentation');
var todoRouter = require('./routes/todos');

var app = express();

// database
var Pool = require('pg').Pool;
var config = {
  user: 'jorge',
  host: 'localhost',
  database: 'todos',
  password: '',
  port: 5432,
}

var pool = new Pool(config);

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

// callback - checkout a client
pool.connect((err, client) => {
  if (err) throw err;
  client.query('SELECT * FROM todos', (err, res) => {
    if (err) {
      console.log(err.stack)
    } else {
      console.log(res.rows)
    }
  })
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/', docRouter);
app.use('/', todoRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
