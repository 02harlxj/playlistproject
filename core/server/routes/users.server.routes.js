'use strict';

// Load module dependencies
var users = require('../controllers/users.server.controllers'),
	libraryItem = require('../controllers/librarySort.server.controllers'),
	playlists = require('../../../playlists/server/playlists.server.controllers'),
	passport = require('passport');

module.exports = function(app) {

/*================================================
	RENDER PAGES
================================================*/

	// Set up the 'tour' route

	// Set up the 'Application Home' route
	app.get('/', users.renderHome);
	app.get('/sharedplaylist/:sharedId', users.renderHomeOrGuest);
	app.get('/playlist/:playlistId', users.renderHomeOrGuest);
	app.get('/user/:userId', users.renderHomeOrGuest);
	app.get('/user/:userId/profile', users.renderHomeOrGuest);

	app.get('/user/:userId/playlist/:playlistId', users.renderHomeOrGuest);
	app.get('/shared/:userId/guest', users.renderHomeOrGuest);

	app.get('/library', users.renderHome);
	app.get('/events', users.renderHome);
	app.get('/friends', users.renderHome);

	app.get('/guest/sharedplaylist/:sharedId', users.renderGuest);
	app.get('/guest/playlist/:playlistId', users.renderGuest);
	app.get('/guest/user/:userId', users.renderGuest);
	app.get('/guest/tour', users.renderHome);

/*================================================
	USER ROUTES
================================================*/

	app.get('/oauth/facebook', passport.authenticate('facebook', {
		scope: 'user_friends',
		failureRedirect: '/tour'
	}));

	app.get('/oauth/facebook/callback', passport.authenticate('facebook', {
		failureRedirect: '/tour',
		successRedirect: '/'
	}));

	// Get User
	app.route('/api/user/:id')
		.get(users.checkAuth, users.getUser)
		.post(users.checkAuth, users.changeDetails)
		.delete(users.checkAuth, users.deleteaccount);

	// Get Friend
	app.get('/api/friend/:friendId', users.getFriend);
	app.post('/api/friends/find', users.getFriends);

	// Logout
	app.get('/signout', users.signout);

	// Search Users
	app.get('/api/user/:id/users/search', users.checkAuth, users.search);

/*================================================
	LIBRARY ROUTES
================================================*/

	app.route('/api/user/:id/library')
		.post(users.checkAuth, users.addSongToLibrary);

	app.delete('/api/user/:id/library/:songId', users.checkAuth, playlists.removeSongFromPlaylists, users.removeSongFromLibrary);

	app.post('/api/user/:id/library/:songId/edit', users.checkAuth, playlists.editSongDetails, users.editSongDetails);

	app.get('/api/user/:id/library/order', users.checkAuth, libraryItem.order);

	app.get('/api/user/:id/library/search', users.checkAuth, libraryItem.searchList);

	app.get('/api/user/:id/library/scroll', users.checkAuth, libraryItem.scrollAdd);




};









