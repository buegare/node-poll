const mongoose = require('mongoose');
const config = require('../config/mongodb');

mongoose.connect(`mongodb://${config.db.server}/${config.db.collection}`);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

let PollSchema = mongoose.Schema({
	title: { type: String, require: true },
	answers: [{ answer: String}],
	creator: { type: String, default: 'anonymous' },
  	date: { type: Date, default: Date.now },
});

const Poll = module.export = db.model('Poll', PollSchema);
module.exports = Poll;

// module.export.getPosts = function(skip, limit, cb) {
// 	this.find(function (err, posts) {
// 	  if (err) return console.error(err);
// 	  return cb(posts);
// 	}).sort('-date').skip(skip).limit(limit);
// };

module.export.create = function(newPoll, cb) {
	
	newPoll.save((err, poll) => {
		if (err) return console.error(err);
	});

};

// module.export.getPostBySlug = function(slug, cb) {
// 	this.findOne({ 'slug': slug }, function (err, post) {
// 	  if (err) return console.error(err);
// 	  return cb(post);
// 	});
// };

// module.export.addNewComment = function(new_comment, cb) {
// 	this.findOne({ 'slug' : new_comment.slug }, function (err, post) {
// 		if (err) return console.error(err);

// 		post.comments.push({name: new_comment.name, body: new_comment.body});
		
// 		post.save((err, post) => {
// 			if (err) return console.error(err);
// 			cb(post);
// 		});
// 	});
// };

// module.export.deleteComment = function(comment, cb) {
// 	this.findById(comment.postId, function (err, post) {
// 	  if (err) return console.error(err);

// 		post.comments.splice(comment.commentId, 1);
		
// 		post.save((err, post) => {
// 			if (err) return console.error(err);
// 			cb(post);
// 		});
// 	});
// };

// module.export.deletePost = function(postId) {
// 	this.findByIdAndRemove(postId, function (err, post) {  
// 		if (err) return console.error(err);
// 	});
// };

// module.export.updatePost = function(edited_post, cb) {
// 	this.findByIdAndUpdate(edited_post.id, {
// 		$set: { 
// 			title: edited_post.title, 
// 			category: edited_post.category, 
// 			body: edited_post.body,
// 			slug: slugfy(edited_post.title)
// 		}}, { new: true }, function (err, post) {
// 	  if (err) return console.error(err);
// 	  cb(post);
// 	});
// };