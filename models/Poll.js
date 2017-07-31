const config = require('../config/mongodb');

const db = config.mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

const PollSchema = config.mongoose.Schema({
  title: { type: String, required: true },
  answers: [
    {
      body: { type: String, required: true },
      votes: { type: Number, default: 0 }
    }
  ],
  creator: { type: String, default: 'anonymous' },
  date: { type: Date, default: Date.now }
});

const Poll = db.model('Poll', PollSchema);
module.export = db.model('Poll', PollSchema);
module.exports = Poll;

module.export.getPolls = function getPolls(username, cb) {
  this.find({ creator: username }, (err, posts) => {
    if (err) return console.error(err);
    return cb(posts);
  }).sort('-date');
};

module.export.create = function create(newPoll, cb) {
  newPoll.save((err, poll) => {
    if (err) return console.error(err);
    return cb(poll);
  });
};

module.export.getPollById = function getPollById(pollId, cb) {
  this.findById(pollId, (err, poll) => {
    if (err) return console.error(err);
    return cb(poll);
  });
};

module.export.updateVote = function updateVote(pollId, answerId, cb) {
  this.findById(pollId, (err, poll) => {
    if (err) return console.error(err);

    poll.answers.findIndex((answer) => {
      if (answer._id == answerId) {
        answer.votes += 1;
      }
    });

    poll.save((error) => {
      if (error) return console.error(error);
    });

    return cb(poll);
  });
};

module.export.deletePoll = function deletePoll(pollId) {
  this.deleteOne(pollId, err => console.error(err));
};
