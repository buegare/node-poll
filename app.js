const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const expressValidator = require('express-validator');
const logger = require('morgan');
const bodyParser = require('body-parser');
const configServer = require('./config/server.js');
const path = require('path');
const Poll = require('./models/Poll');
const User = require('./models/User');
const flash = require('connect-flash');
const google = require('googleapis');
const configGoogle = require('./config/google.js');

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

function getOAuthClient() {
  const OAuth2 = google.auth.OAuth2;
  return new OAuth2(configGoogle.clientId, configGoogle.clientSecret, configGoogle.redirectionURL);
}

function getAuthUrl() {
  const oauth2Client = getOAuthClient();
  const scopes = [
    'https://www.googleapis.com/auth/plus.me',
    'https://www.googleapis.com/auth/gmail.readonly'
  ];
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes
  });
  return url;
}


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
  const url = getAuthUrl();
  res.render('index', { url });
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

// Show poll
app.get('/poll/:poll_id', (req, res) => {
  if (req.params.poll_id.match(/^[0-9a-fA-F]{24}$/)) {
    Poll.getPollById(req.params.poll_id, (poll) => {
      if (poll) {
        if (poll.creator === 'anonymous') {
          res.render('poll/show', { poll });
        } else if (req.session.user && poll.creator === req.session.user) {
          res.render('poll/show', { poll });
        } else {
          return res.redirect('/');
        }
      } else {
        res.render('poll/show', {
          notfound: true
        });
      }
    });
  } else {
    res.render('poll/show', {
      notfound: true
    });
  }
});

// Delete poll
app.delete('/poll/delete', (req, res) => {
  Poll.deletePoll(req.body.poll_id);
  req.flash('success_msg', 'Poll deleted successfully !');
  res.end();
});

// Update vote
app.post('/poll/:poll_id/vote', (req, res) => {
  Poll.updateVote(req.params.poll_id, req.body.answer, (poll) => {
    res.redirect(`/poll/${poll._id}`);
  });
});

function createUser(username, password, req, res) {
  const newUser = new User({ username, password });

  User.create(newUser, (err, user) => {
    if (err) {
      res.locals.error_msg = err;
      res.render('index');
    } else {
      req.flash('success_msg', 'Thank you for signing up !');
      req.session.user = user.username;
      res.redirect(`/user/${user.username}/polls`);
    }
  });
}

// Sign up user
app.post('/user/create', (req, res) => {
  createUser(req.body.username, req.body.password, req, res);
});

function listLabels(auth) {
  const gmail = google.gmail('v1');
  gmail.users.labels.list({
    auth,
    userId: 'me',
  }, (err, response) => {
    if (err) {
      console.log(`The API returned an error: ${err}`);
      return;
    }
    const labels = response.labels;
    if (labels.length === 0) {
      console.log('No labels found.');
    } else {
      console.log('Labels:');
      for (let i = 0; i < labels.length; i++) {
        const label = labels[i];
        console.log('- %s', label.name);
      }
    }
  });
}

// Google oauth
app.use('/oauth2callback', (req, res) => {
  const oauth2Client = getOAuthClient();
  const plus = google.plus('v1');
  oauth2Client.getToken(req.query.code, (err, tokens) => {
    if (!err) {
      oauth2Client.setCredentials(tokens);
      req.session.tokens = tokens;

      plus.people.get({ userId: 'me', auth: oauth2Client }, (error, response) => {
        if (error) return console.error(error);
        listLabels(oauth2Client);

        User.googleUserExists(response.id, (user) => {
          if (user) {
            req.session.user = response.id;
            req.flash('success_msg', 'Signed in successfully !');
            res.redirect(`/user/${response.id}/polls`);
          } else {
            createUser(response.id, response.etag, req, res);
          }
        });
      });
    } else {
      res.locals.error_msg = 'Login failed !';
      res.render('index');
    }
  });
});

// Login user
app.post('/', (req, res) => {
  User.login(req.body.username, req.body.password, (err, user) => {
    if (err) {
      res.locals.error_msg = err;
      res.render('index');
    } else {
      req.session.user = req.body.username;
      req.flash('success_msg', 'Signed in successfully !');
      res.redirect(`/user/${user.username}/polls`);
    }
  });
});

const auth = (req, res, next) => {
  if (req.session && req.session.user === req.params.username) return next();
  return res.redirect('/');
};

// Show all polls of a user
app.get('/user/:username/polls', auth, (req, res) => {
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

app.listen(configServer.server.port, () => console.log(`Server started on port ${configServer.server.port}...`));
