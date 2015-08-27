'use strict';

var users = require('../../core/server/controllers/users.server.controllers'),
	events = require('../server/events.server.controllers'),
	passport = require('passport');

module.exports = function(app) {

	// Artist List API
	app.post('/api/user/:id/artistlist', users.checkAuth, events.addNewArtist);

	app.route('/api/user/:id/artistlist/:artistId')
		.post(users.checkAuth, events.renameArtist)
		.delete(users.checkAuth, events.removeArtist);

};