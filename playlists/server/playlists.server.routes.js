'use strict';

// Load module dependencies
var users = require('../../core/server/controllers/users.server.controllers'),
	playlists = require('../server/playlists.server.controllers'),
	songs = require('../server/songs.server.controllers'),
	passport = require('passport');

module.exports = function(app) {

	// PLAYLIST ROUTES

	app.post('/api/user/:id/playlists', users.checkAuth, playlists.addNew);

	app.route('/api/user/:id/playlists/:playlistId')
		.get(users.checkAuth, playlists.checkAuth, playlists.getPlaylist)
		.post(users.checkAuth, playlists.checkAuth, playlists.renamePlaylist)
		.delete(users.checkAuth, playlists.checkAuth, playlists.removePlaylist);

	app.post('/api/user/:id/playlists/:playlistId/privacy', users.checkAuth, playlists.checkAuth, playlists.setPrivacy)

	// OTHER USERS PLAYLIST ROUTES

	app.get('/api/otheruser/:id/playlist/:playlistId', playlists.getOthersPlaylist);

	app.get('/guest/:id/playlist/:playlistId', playlists.guestViewPlaylist);

	// SONG ROUTES

	app.post('/api/user/:id/playlists/:playlistId/song', users.checkAuth, playlists.checkAuth, songs.addSongToPlaylist);

	app.post('/api/user/:id/playlists/:playlistId/song/dragged', users.checkAuth, playlists.checkAuth, songs.dragSongToPlaylist);

	app.post('/api/user/:id/playlists/:playlistId/songs/update', users.checkAuth, playlists.checkAuth, songs.updateSongs);


};







