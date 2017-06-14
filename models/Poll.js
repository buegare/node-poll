const config = require('../config/mongodb');

const db = config.mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

let PollSchema = config.mongoose.Schema({
	title: { type: String, require: true },
	answers: [
	{ 
		body: {
			type: String, 
			require: true
		}, 
		votes: { 
			type: Number, 
			default: 0 
		}
	}
],
	creator: { type: String, default: 'anonymous' },
  	date: { type: Date, default: Date.now }
});

const Poll = module.export = db.model('Poll', PollSchema);
module.exports = Poll;

module.export.getPolls = function(username, cb) {
	this.find({ 'creator': username }, function (err, posts) {
	  if (err) return console.error(err);
	  return cb(posts);
	}).sort('-date');
};

module.export.create = function(newPoll, cb) {
	newPoll.save((err, poll) => {
		if (err) return console.error(err);
		return cb(poll);
	});

};

module.export.getPollById = function(poll_id, cb) {
	this.findById(poll_id, function (err, poll) {
	  if (err) return console.error(err);
	  cb(poll);
	});
};

module.export.updateVote = function(poll_id, answer_id, cb) {
	this.findById(poll_id, function (err, poll) {
		if (err) return console.error(err);
	  
		poll.answers.findIndex(function(answer) {
			if(answer._id == answer_id) {
				answer.votes += 1;
			}
		});

		poll.save((err, poll) => {
			if (err) return console.error(err);
			cb(poll);
		});
	  
	});
};