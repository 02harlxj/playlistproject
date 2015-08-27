'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

	require('../../../core/server/models/users.server.model');

var CommentSchema = new Schema({
	comment: String,
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	time: {
		type: Date,
		default: Date.now
	},
	likedBy: [{
		type: Schema.Types.ObjectId,
		ref: 'User'
	}]

});


var SharedSongSchema = new Schema({
	title: String,
	artist: String,
	added: {
		type: Date,
		default: Date.now
	},
	provider: String,
	videoId: String,
	playlistId: String,
	addedBy: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	comments: [CommentSchema],
	commenters: [{
		type: Schema.Types.ObjectId
	}],
	likedBy: [{
		type: Schema.Types.ObjectId,
		ref: 'User'
	}]
});

mongoose.model('SharedSong', SharedSongSchema);