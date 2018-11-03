const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

if (process.env.NODE_ENV === 'development') {
  require("dotenv").config();
}

const indexRouter = require('./routes/index');
const testsRouter = require('./routes/tests');
const gameRouter = require('./routes/game');
const registrationRouter = require('./routes/registration');
const lobbyRouter = require('./routes/lobby');
const loginRouter = require('./routes/login');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/game', gameRouter);
app.use('/lobby', lobbyRouter);
app.use('/registration', registrationRouter);
app.use('/login', loginRouter);
app.use('/tests', testsRouter);


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
