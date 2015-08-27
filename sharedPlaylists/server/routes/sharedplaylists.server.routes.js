'use strict';

// Load module dependencies
var users = require('../../../core/server/controllers/users.server.controllers'),
	sharedPlaylists = require('../controllers/sharedplaylists.server.controller'),
	member = require('../controllers/members.server.controller'),
	notification = require('../controllers/notifications.server.controller'),
	sharedSongs = require('../controllers/sharedsongs.server.controller'),
	passport = require('passport');

module.exports = function(app, io) {

var includeIo = function(req, res, next) {
	req.io = io;
	next();
}

/*==========================================================
	NOTIFICATION routes
==========================================================*/

// GET
	app.get('/api/user/:id/notifications', users.checkAuth, includeIo, notification.get);

// EDIT
	app.post('/api/user/:id/notifications/:notifId', users.checkAuth, notification.viewed);


/*==========================================================
	SHARED PLAYLIST routes
==========================================================*/

// CREATE
	app.post('/api/user/:id/shared', users.checkAuth, sharedPlaylists.create);


// EDIT
	app.post('/api/user/:id/shared/:sharedId', 	users.checkAuth, 
													sharedPlaylists.get, 
													sharedPlaylists.adminCheck, sharedPlaylists.edit);
	// If not Admin follow next stack
		app.post('/api/user/:id/shared/:sharedId', sharedPlaylists.permissionsFail);


// GET
	app.get('/api/user/:id/shared/:sharedId', 	sharedPlaylists.get, 
													sharedPlaylists.memberCheck, sharedPlaylists.populateUsers, sharedSongs.populateSongs);
// INVITED
	app.get('/api/user/:id/shared/:sharedId/invited', sharedPlaylists.get, sharedPlaylists.invitedCheck, sharedPlaylists.populateUsers, sharedSongs.populateSongs);
// GUEST
	app.get('/api/shared/:sharedId/guest', sharedPlaylists.get, sharedPlaylists.privateCheck, sharedPlaylists.populateUsers, sharedSongs.populateSongs);



		
/*==========================================================
	SHARED MEMBER routes
==========================================================*/



// CREATE
	app.post('/api/user/:id/shared/:sharedId/member', 	users.checkAuth, 
															sharedPlaylists.get,
															sharedPlaylists.adminCheck, member.add, includeIo, notification.inviteMember);
		// If not admin, check if song approval is needed.
		app.post('/api/user/:id/shared/:sharedId/member', sharedPlaylists.memberCheck,
															  sharedPlaylists.addMemberCheck, member.add, includeIo, notification.inviteMember);
		// If members must be approved by an admin first
		app.post('/api/user/:id/shared/:sharedId/member', member.proposeAdd, includeIo, notification.proposeMember);

// REQUEST JOIN
	app.post('/api/user/:id/shared/:sharedId/requestjoin', users.checkAuth, sharedPlaylists.get, member.proposeAdd, includeIo, notification.proposeMember);

// LEAVE
	app.delete('/api/user/:id/shared/:sharedId/member/:memberId', 	users.checkAuth, sharedPlaylists.get, sharedPlaylists.thisMemberCheck, member.leave, notification.removeUser);

// REMOVE
	app.delete('/api/user/:id/shared/:sharedId/member/:memberId/remove', 	users.checkAuth, 
																			sharedPlaylists.get, 
																			sharedPlaylists.adminCheck, member.removeUser, notification.removeUser);

		app.delete('/api/user/:id/shared/:sharedId/member/:memberId/remove', sharedPlaylists.thisMemberCheck, member.removeUser, notification.removeUser);

// Make Admin
	app.post('/api/user/:id/shared/:sharedId/member/:memberId/makeAdmin', users.checkAuth, sharedPlaylists.get, sharedPlaylists.adminCheck, member.makeAdmin, includeIo, notification.madeAdmin);


// Accept/Reject 
	// Accept
	app.post('/api/user/:id/shared/:sharedId/member/accept', users.checkAuth, member.accept, notification.proposeDelete);
	// Decline
	app.post('/api/user/:id/shared/:sharedId/member/decline', users.checkAuth, member.decline, notification.proposeDelete);

// Approval Needed
	app.get('/api/user/:id/shared/:sharedId/itemsApproval', users.checkAuth, sharedPlaylists.get, sharedPlaylists.itemsApproval);

// Approval 
	// Accept
	app.post('/api/user/:id/shared/:sharedId/member/:memberId/approve', users.checkAuth, sharedPlaylists.get, sharedPlaylists.adminCheck, member.approve, includeIo, notification.inviteMember);
	// Decline
	app.post('/api/user/:id/shared/:sharedId/member/:memberId/reject', users.checkAuth, sharedPlaylists.get, sharedPlaylists.adminCheck, member.reject);

/*==========================================================
	SHARED SONG routes
==========================================================*/

// CREATE
	app.post('/api/user/:id/shared/:sharedId/sharedSong/song', 	users.checkAuth, sharedPlaylists.get, sharedPlaylists.memberCheck, sharedSongs.add, includeIo, notification.songAdded);
	app.post('/api/user/:id/shared/:sharedId/sharedSong/dragto', 	users.checkAuth, sharedPlaylists.get, sharedPlaylists.memberCheck, sharedSongs.dragto, includeIo, notification.songAdded);

// Search
	app.get('/api/user/:id/shared/:sharedId/search', users.checkAuth, sharedSongs.searchList);

// Order
	app.get('/api/user/:id/shared/:sharedId/order', users.checkAuth, sharedSongs.searchList);


// GET
	app.get('/api/user/:id/shared/:sharedId/sharedSong/song/:songId', sharedSongs.get, sharedSongs.send);

// EDIT
	app.post('/api/user/:id/shared/:sharedId/sharedSong/song/:songId', 	users.checkAuth, 
																			sharedPlaylists.get,
																			sharedPlaylists.adminCheck, sharedSongs.edit);
		// if not admin, check if author - if not, not permitted
		app.post('/api/user/:id/shared/:sharedId/sharedSong/song/:songId', sharedSongs.get, sharedSongs.authorCheck, sharedSongs.edit);

// DELETE
	app.delete('/api/user/:id/shared/:sharedId/sharedSong/song/:songId', 	users.checkAuth, 
																			sharedSongs.get, 
																			sharedPlaylists.get,
																			sharedPlaylists.adminCheck, sharedSongs.delete, notification.songRemoved);
		// if not admin, check if author - if not, not permitted
		app.delete('/api/user/:id/shared/:sharedId/sharedSong/song/:songId', sharedSongs.authorCheck, sharedSongs.delete, notification.songRemoved);


/*==========================================================
	COMMENT routes
==========================================================*/

// GET
	app.get('/api/user/:id/sharedSong/:songId/comments', users.checkAuth, sharedSongs.get, sharedSongs.getComments);

// POST
	app.post('/api/user/:id/shared/:sharedId/sharedSong/:songId/comment', users.checkAuth, sharedSongs.get, sharedSongs.addComment, includeIo, notification.addComment);

/*==========================================================
	LIKE routes
==========================================================*/

// POST
	app.post('/api/user/:id/shared/:sharedId/sharedSong/:songId/like', users.checkAuth, sharedSongs.get, sharedSongs.addLike, includeIo, notification.addLike);

};
