const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/nodepoll');

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

module.exports = {
	mongoose: mongoose,
	db: db 
};