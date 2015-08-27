'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

require('../models/sharedplaylist.server.model');
require('../models/sharedsong.server.model');

var NotificationSchema = new Schema({
	type: {
		type: String,
		enum: ['comment', 'like', 'invite', 'approval_song', 'approval_member', 'new_song', 'madeAdmin']
	},
	userId: Schema.Types.ObjectId,
	viewed: {
		type: Boolean,
		default: false
	},
	sender: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	added: {
		type: Date,
		default: Date.now,
		expires: 60*60*24*18
	},
	playlistName: String, 

	//Comment & Liked only
	subjectId: {
		type: Schema.Types.ObjectId,
		ref: 'SharedSong'
	},
	participantNum: {
		type: Number,
		default: 1
	},

	//Playlist Request & Approval Request only
	requestId: {
		type: Schema.Types.ObjectId,
		ref: 'SharedPlaylist'
	}

});

// Use a pre-save middleware to hash the password
NotificationSchema.pre('save', function(next) {
	this.added = new Date();

	next();
});

mongoose.model('Notification', NotificationSchema);