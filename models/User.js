const config = require('../config/mongodb');

const db = config.mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

const UserSchema = config.mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const User = db.model('User', UserSchema);
module.export = db.model('User', UserSchema);
module.exports = User;

module.export.create = function create(newUser, cb) {
  newUser.save((err, user) => {
    if (err) {
      if (err.code === 11000) {  // check if there was duplication
        const error = 'Sorry, this username has been taken';
        return cb(error, user);
      }
      if (err.message === 'User validation failed') {
        const error = "Username and Password can't be blank";
        return cb(error, user);
      }
      return console.error(err);
    }
    return cb(null, user);
  });
};

module.export.login = function login(username, pwd, cb) {
  this.findOne({ username }, (err, user) => {
    if (err) return console.error(err);
    if (!user) {
      const error = 'User not found';
      return cb(error, user);
    }
    if (pwd !== user.password) {
      const error = 'Wrong credentials';
      return cb(error, user);
    }
    return cb(null, user);
  });
};

module.export.googleUserExists = function googleUserExists(username, cb) {
  this.findOne({ username }, (err, user) => {
    if (err) return console.error(err);
    return cb(user);
  });
};
