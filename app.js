const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const expressValidator = require('express-validator');
const logger = require('morgan');
const bodyParser = require('body-parser');
const config = require('./config/server.js');
const path = require('path');
const Poll = require('./models/Poll');
const User = require('./models/User');
const flash = require('connect-flash');

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
  cookie: { maxAge: 3600000 },
}));

app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

// view engine setup
app.set('view engine', 'pug');

// Enable server to log requests
app.use(logger('common'));

app.use(flash());

// Validator
app.use(expressValidator(
  {
    errorFormatter: (param, msg, value) => {
      const namespace = param.split('.');
      const root = namespace.shift();
      let formParam = root;

      while (namespace.length) {
        formParam += `[${namespace.shift()}]`;
      } return {
        param: formParam,
        msg,
        value,
      };
    },

    customValidators: {
      isAllElemInArrayDiff: (value) => {
        const uniqValuesArray = [...new Set(value)]; // Returns Array with uniq elements
        return value.length === uniqValuesArray.length;
      },
      hasAtLeastTwoAnswers: value => value[0] !== '' && value[1] !== ''
    },
  }
));

app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.validation_error = '';
  res.locals.user = req.session.user || null;
  next();
});

app.get('/', (req, res) => {
  res.render('index');
  app.locals.msg = null;
});

// Create poll
app.post('/poll/create', (req, res) => {
  // Form validation
  req.checkBody('title', 'Title is required').notEmpty();
  req.checkBody('answer', 'You should provide at least two answers for your poll').hasAtLeastTwoAnswers();
  req.checkBody('answer', 'Answers have to be different from each other').isAllElemInArrayDiff();

  const errors = req.validationErrors();

  if (errors) {
    res.locals.validation_error = errors;
    res.render('index', {
      title: req.body.title,
      answer: req.body.answer
    });
    return;
  }

  const newPoll = new Poll({
    title: req.body.title,
    creator: req.session.user,
    answers: []
  });

  for (let i = 0; i < req.body.answer.length; i += 1) {
    newPoll.answers.push({ body: req.body.answer[i] });
  }

  Poll.create(newPoll, (poll) => {
    req.flash('success_msg', 'Your new poll have been created successfully !');
    res.redirect(`/poll/${poll._id}`);
  });
});

app.get('/poll/:poll_id', (req, res) => {
  if (req.params.poll_id.match(/^[0-9a-fA-F]{24}$/)) {
    Poll.getPollById(req.params.poll_id, (poll) => {
      res.render('poll/show', {
        poll
      });
    });
  } else {
    res.render('poll/show', {
      notfound: true
    });
  }
});

// Update vote
app.post('/poll/:poll_id/vote', (req, res) => {
  Poll.updateVote(req.params.poll_id, req.body.answer, (poll) => {
    res.redirect(`/poll/${poll._id}`);
  });
});

// Sign up user
app.post('/user/create', (req, res) => {
  const newUser = new User({
    username: req.body.username,
    password: req.body.password
  });

  User.create(newUser, (user) => {
    req.flash('success_msg', 'Thank you for signing up !');
    req.session.user = user.username;
    res.redirect(`/user/${user.username}/polls`);
  });
});

// Login user
app.post('/', (req, res) => {
  User.getUserByUsername(req.body.username, (user) => {
    if (user) {
      if (user.password !== req.body.password) {
        res.locals.error_msg = 'Wrong creadentials';
        res.render('index');
        return;
      }
      req.session.user = req.body.username;
      req.flash('success_msg', 'Signed in successfully !');
      res.redirect(`/user/${user.username}/polls`);
    } else {
      res.locals.error_msg = 'User not found';
      res.render('index');
    }
  });
});

// Show all polls of a user
app.get('/user/:username/polls', (req, res) => {
  Poll.getPolls(req.params.username, (polls) => {
    res.render('user/show', {
      polls
    });
  });
});

// Logout user
app.get('/user/logout', (req, res) => {
  req.session.destroy();
  app.locals.msg = 'You succesfully logged out';
  res.redirect('/');
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(config.server.port, () => console.log(`Server started on port ${config.server.port}...`));
