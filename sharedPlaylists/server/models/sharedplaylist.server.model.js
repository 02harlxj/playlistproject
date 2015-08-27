'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

require('../../../core/server/models/users.server.model');
require('../models/sharedsong.server.model');


var SharedPlaylistSchema = new Schema({
	name: String,
	creator: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	admins: [{
		type: Schema.Types.ObjectId,
		ref: 'User'
	}],
	users: [{
		type: Schema.Types.ObjectId,
		ref: 'User'
	}],
	users_waiting_approval: [{
		type: Schema.Types.ObjectId,
		ref: 'User'
	}],
	users_waiting_response: [{
		type: Schema.Types.ObjectId,
		ref: 'User'
	}],
	settings: {
		desc: {
			type: String,
			default: 'A description of this playlist'
		},
		private: {
			type: Boolean,
			default: false
		},
		permissions: {
			memberAdd: {
				type: String,
				default: 'approval_required',
				enum: ['admin_only', 'approval_required', 'anybody']
			},
			songAdd: {
				type: String,
				default: 'anybody',			
				enum: ['approval_required', 'anybody']
			},
			songDelete: {
				type: String,
				default: 'approval_required',
				enum: ['admin_only', 'approval_required', 'anybody']
			}
		}
	},
	songs: [{
		type: Schema.Types.ObjectId,
		ref: 'SharedSong'
	}],
	songs_waiting: [{
		type: Schema.Types.ObjectId,
		ref: 'SharedSong'
	}],
	created: {
		type: Date,
		default: Date.now
	}
});

mongoose.model('SharedPlaylist', SharedPlaylistSchema);
