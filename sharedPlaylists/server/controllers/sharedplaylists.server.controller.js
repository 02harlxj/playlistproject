'use strict';

var SharedPlaylist = require('mongoose').model('SharedPlaylist'),
	User = require('mongoose').model('User'),
	passport = require('passport');

/*==========================================================
	Permissons Checks
==========================================================*/

exports.adminCheck = function(req, res, next) {

	var is_admin = false;
	for(var i=0; i < req.playlist.admins.length; i++) {
		if(req.user._id.equals(req.playlist.admins[i])) {
			is_admin = true;
		}
	}

	if (is_admin) {
		next();
	} else {
		next('route');
	}

};

exports.privateCheck = function(req, res, next) {
	if(req.playlist.settings.private === true) {
		res.json('permissions_failure');
	} else {
		next();
	}
};

exports.memberCheck = function(req, res, next) {
	var is_member = false;
	var members = req.playlist.users.concat(req.playlist.admins);
	for(var i=0; i < members.length; i++) {
		if(req.user._id.equals(members[i])) is_member = true;
	}

	if(is_member) {
		next();
	} else {
		res.json('permissions_failure');
	}
};

exports.invitedCheck = function(req, res, next) {
	var is_invited = false;
	var members = req.playlist.users_waiting_response;
	for(var i=0; i < members.length; i++) {
		if(req.user._id.equals(members[i])) is_invited = true;
	}

	if(is_invited) {
		next();
	} else {
		res.json('permissions_failure');
	}
};

exports.thisMemberCheck = function(req, res, next) {
	if(req.user._id.equals(req.params.memberId)) {
		next()
	} else {
		res.json('permissions_failure');
	}
};

exports.addMemberCheck = function(req, res, next) {
	if(req.playlist.settings.permissions.memberAdd === 'anybody') {
		next();
	} else if(req.playlist.settings.permissions.memberAdd === 'approval_required') {
		next('route');
	}
};

exports.addSongCheck = function(req, res, next) {
	if(req.playlist.settings.permissions.songAdd === 'anybody') {
		next();
	} else {
		next('route');
	}
};

exports.guestRedirect = function(req, res, next) {
	res.json('redirect');
}


/*==========================================================
	Operations
==========================================================*/


// Create new SharedPlaylist
exports.create = function(req, res, next) {
	var sharedPlaylist = new SharedPlaylist({name: req.body.name});
	sharedPlaylist.admins.push(req.user._id);
	sharedPlaylist.creator = req.user._id;
	sharedPlaylist.save(function(err, playlist) {
		if(err) return next(err);
		req.user.sharedPlaylists.push(playlist._id);
		req.user.save(function(err, user) {
			res.json(playlist);
		});
	});
};

// Edit SharedPlaylist
exports.edit = function(req, res, next) {
	req.playlist.settings = req.body.settings;
	req.playlist.name = req.body.name;
	req.playlist.save(function(err, playlist) {
		res.json(playlist);
	});
};

// Get SharedPlaylist 
exports.populateUsers = function(req, res, next) {
	SharedPlaylist.populate(req.playlist,[
			{path:'admins', select: 'photoUrl fullName'},
			{path:'users', select: 'photoUrl fullName'},
		], function(err, playlist) {
			req.playlist = playlist;
			next();
		});
};

exports.itemsApproval = function(req, res, next) {
	SharedPlaylist.populate(req.playlist, {path:'users_waiting_approval', select: 'photoUrl fullName'}, function(err, playlist){
		console.log(err);
		if(err) return next(err);
		if(playlist) {
			return res.json(playlist.users_waiting_approval);
		} else {
			return res.status(404).end();
		}
	});
};

/*==========================================================
	Generic Operations
==========================================================*/

exports.get = function(req, res, next) {
	SharedPlaylist.findById(req.params.sharedId, function(err, playlist) {
		req.playlist = playlist;
		next();
	});
};

exports.permissionsFail = function(req, res, next) {
	res.json("permissions_failure");
}
