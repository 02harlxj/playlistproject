'use strict';

// Load module dependencies
var config = require('./config'),
	mongoose = require('mongoose');

// Mongoose config method definition
module.exports = function() {

	//connect to MongoDB
	var db = mongoose.connect(config.db);

	// Load models
	require('../../../playlists/server/playlists.server.model');
	require('../models/users.server.model.js');
	require('../models/libraryItem.server.model.js');
	//shared
	require('../../../sharedPlaylists/server/models/sharedplaylist.server.model');
	require('../../../sharedPlaylists/server/models/sharedsong.server.model');
	require('../../../sharedPlaylists/server/models/notification.server.model');

	return db;
}