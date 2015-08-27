'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var LibraryItemSchema = new Schema({
	userId: String,
	title: String,
	artist: String,
	album: String,
	genre: String,
	added: {
		type: Date,
		default: Date.now
	},
	provider: String,
	videoId: String
});

mongoose.model('LibraryItem', LibraryItemSchema);