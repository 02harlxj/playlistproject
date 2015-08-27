'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

require('../../core/server/models/users.server.model');

var PlaylistSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	private: {
		type: Boolean,
		default: false
	},
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	songs: [{
		title: String,
		artist: String,
		album: String,
		genre: String,
		added: {
			type: Date,
			default: Date.now
		},
		provider: String,
		videoId: String,
		order: Number
	}],
	viewCount: {
		type: Number,
		default: 0
	}
});

mongoose.model('Playlist', PlaylistSchema);