'use strict';

var SharedPlaylist = require('mongoose').model('SharedPlaylist'),
	User = require('mongoose').model('User'),
	passport = require('passport');


/*==========================================================
	Operations
==========================================================*/

exports.add = function(req, res, next) {
	for(var i=0; i<req.body.length; i++) {
		req.playlist.users_waiting_response.push(req.body[i]);
	}
	req.playlist.save();
	next();
};


exports.proposeAdd = function(req, res, next) {
	
	for(var i=0; i<req.body.length; i++) {
		req.playlist.users_waiting_approval.push(req.body[i]);
	}

	req.playlist.save(function(err, playlist) {
		next();
	});
};



// Make member an admin
exports.makeAdmin = function(req, res, next) {
	SharedPlaylist.findOneAndUpdate(
		{_id: req.params.sharedId},
		{
			$pull: {users: req.params.memberId}
		},
		function(err, data) {
			data.admins.push(req.params.memberId);
			data.save(function(err, playlist) {
				if(err) return next(err);
				req.playlist = playlist;
				next();
			});
		}
	);
};

// Remove User

exports.removeUser = function(req, res, next) {
	console.log('remove');
	User.findOneAndUpdate(
		{_id: req.params.memberId},
		{$pull: {sharedPlaylists: req.params.sharedId}},
		function(){}
	);

	SharedPlaylist.findOneAndUpdate(
		{_id: req.params.sharedId}, 
		{
			$pull: {users: req.params.memberId, admins: req.params.memberId}
		},
		function(err, playlist) {
			req.playlist = playlist;
			SharedPlaylist.populate(req.playlist, [
				{path: 'admins', select: 'fullName photoUrl'},
				{path: 'users', select: 'fullName photoUrl'}
			], function() {
				next();
			});
		}
	);
};

// Leave Playlist
exports.leave = function(req, res, next) {

	Users.findById(req.params.memberId, function(err, user) {
		var a = req.user.sharedPlaylists.id(req.playlist._id);
		if(a) a.remove();
		user.save();
	});

	var b = req.playlist.users.id(req.params.memberId);
	if(b) b.remove();

	var c = req.playlist.admins.id(req.params.memberId);
	if(c) c.remove();

	req.playlist.save();

	next();
};

exports.accept = function(req, res, next) {
	SharedPlaylist.findOneAndUpdate(
		{_id: req.params.sharedId},
		{
			$pull: {users_waiting_response: req.user._id},
			$push: {users: req.user._id}
		},
		function(err, data) {
			if(err) next(err);
			req.playlist = data;
			req.user.sharedPlaylists.push(req.params.sharedId);
			req.user.save(function(err, user) {
				next();
			});
		}
	);
};

exports.decline = function(req, res, next) {
	SharedPlaylist.findOneAndUpdate(
		{_id: req.params.sharedId},
		{
			$pull: {users_waiting_response: {_id: req.user._id}}
		},
		function(err, data) {
			if(err) next(err);
			next();
		}
	);
};

exports.approve = function(req, res, next) {
	console.log('approve');
	//var memberId = new ObjectId(req.params.memberId);
	SharedPlaylist.findOneAndUpdate(
		{_id: req.params.sharedId},
		{
			$pull: {users_waiting_approval: req.params.memberId}
		},
		function(err, data) {
			data.users_waiting_response.push(req.params.memberId);
			data.save(function(err, playlist) {
				if(err) return next(err);
				next();
			});
		}
	);
};

exports.reject = function(req, res, next) {
	SharedPlaylist.findOneAndUpdate(
		{_id: req.params.sharedId},
		{
			$pull: {users_waiting_approval: req.params.memberId}
		},
		function(err, data) {
			if(err) next(err);
			res.status(200).end();
		}
	);
};
