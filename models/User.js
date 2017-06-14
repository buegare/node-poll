const config = require('../config/mongodb');

const db = config.mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

let UserSchema = config.mongoose.Schema({
	username: { type: String, require: true },
	password: { type: String, require: true },
  	date: { type: Date, default: Date.now }
});

const User = module.export = db.model('User', UserSchema);
module.exports = User;

module.export.create = function(newUser, cb) {
	newUser.save((err, user) => {
		if (err) return console.error(err);
		return cb(user);
	});

};

module.export.getUserByUsername = function(username, cb) {
	this.findOne({ 'username': username }, function (err, user) {
	  if (err) return console.error(err);
	  return cb(user);
	});
};