'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

require('../../../playlists/server/playlists.server.model');
require('../../../sharedPlaylists/server/models/sharedplaylist.server.model');
require('../models/libraryItem.server.model');

var UserSchema = new Schema({
	// Welcome Screen
	firstTime: {
		type: Boolean,
		default: true
	},
	// Provider Info
	provider: {
		type: String,
		required: 'Provider is required'
	},
	providerId: String,
	providerData: {},
	// User Info
	firstName: String,
	lastName: String,
	fullName: String,
	email: String,
	username: String,
	photoUrl: String,
	location: String,

	// Events
	artistList: [{
		name: String
	}],

	// Date Created
	created: {
		type: Date,
		default: Date.now
	},

	// Personal Songs
	library: [{
		type: Schema.Types.ObjectId,
		ref: 'LibraryItem'
	}],
	
	playlists: [{
		type: Schema.Types.ObjectId,
		ref: 'Playlist'
	}],

	// Social Activity
	sharedPlaylists: [{
		type: Schema.Types.ObjectId,
		ref: 'SharedPlaylist'
	}],
/*
	followedBy: [{
		type: Schema.ObjectId,
		ref: 'Users'
	}],
	following: [{
		type: Schema.ObjectId,
		ref: 'Users'
	}],
*/
	notifCount: {
		type: Number,
		default: 0
	}
});

mongoose.model('User', UserSchema);