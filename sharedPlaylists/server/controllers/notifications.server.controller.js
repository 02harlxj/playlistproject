'use strict';

var Notification = require('mongoose').model('Notification'),
	User = require('mongoose').model('User'),
	passport = require('passport');


/*==========================================================
	Operations
==========================================================*/

exports.get = function(req, res, next) {
	console.log(req.user._id);
	User.update(
		{_id: req.user._id},
		{notifCount: 0},
		function() {}
	);
	Notification.update(
		{userId: req.user._id},
		{viewed: true},
		{multi: true},
		function() {}
	);
	Notification.find({userId: req.user._id})
				.sort({added: -1})
				.limit(15)
				.populate({
					path: 'sender',
					select: 'fullName photoUrl'
				})
				.exec(function(err, notifs){
					res.json(notifs);
				});
};

exports.viewed = function(req, res, next) {
	Notification.update(
		{_id: req.params.notifId},
		{viewed: true},
		function() {
			res.send(200);
		}
	);
};

// Song Operations

exports.songAdded = function(req, res, next) {
	var recipients = req.playlist.users.concat(req.playlist.admins);

	updateCreateMulti(req.io, req.user._id, req.playlist._id, 'new_song', req.playlist.name, recipients);

	//.to(req.playlist._id.toString())

	res.json(req.song);
};


exports.songRemoved = function(req, res, next) {
	removeAllNotifications(req.params.songId);
	res.json('removed');
};

// Member Operations

exports.inviteMember = function(req, res, next) {
	if(req.body.length === 1) {
		updateCreateSingle(req.io, req.user._id, req.params.sharedId, 'invite', req.playlist.name, req.body[0]);
	} else {
		updateCreateMulti(req.io, req.user._id, req.params.sharedId, 'invite', req.playlist.name, req.body);
	}
	res.json('done');
};

exports.removeUser = function(req, res, next) {
	removeUserNotifications(req.params.memberId, req.params.sharedId);
	res.json(req.playlist);
};

exports.madeAdmin = function(req, res, next) {
	updateCreateSingle(req.io, req.user._id, req.params.sharedId, 'madeAdmin', req.playlist.name, req.params.memberId);

	req.playlist.populate('users admins', 'fullName photoUrl', function(err, playlist) {
		if(err) return next(err);
		var result = {
			admins: playlist.admins,
			users: playlist.users
		}
		res.json(result);
	});

};

exports.proposeMember = function(req, res, next) {
	if(req.playlist.admins.length > 1) {
		updateCreateMulti(req.io, req.user._id, req.params.memberId, 'approval_member', req.playlist.name, req.playlist.admins, req.params.sharedId);
	} else {
		updateCreateSingle(req.io, req.user._id, req.params.memberId, 'approval_member', req.playlist.name, req.playlist.admins[0], req.params.sharedId);
	}
	res.json('done');
};


exports.proposeDelete = function(req, res, next) {
	removeNotification(req.user._id, req.params.sharedId, 'invite');
	if(req.playlist) {
		res.json(req.playlist);
	} else {
		res.json('done');
	}
};

// Comment Operations


exports.addComment = function(req, res, next) {

	var recipients = req.song.commenters;
	var commented = false;

	for(var i=0; i<recipients.length; i++) {
		if(req.song.addedBy.equals(recipients[i])) {
			commented = true;
			break;
		}
	}

	if(commented === false) {
		recipients.push(req.song.addedBy);
	}


	for(var j=0; j<recipients.length; j++) {
		console.log(recipients[j]);
		req.io.to(recipients[j]).emit('comment' + req.params.songId, {photoUrl: req.user.photoUrl, user: req.user._id, content: req.body});
	}

	// remove sender
	updateCreateMulti(req.io, req.user._id, req.params.songId, 'comment', req.song.title, recipients, req.params.sharedId, req.song.commenters.length);

	res.status(200).end();
};

// Like Operations

exports.addLike = function(req, res, next) {
	var recipients = req.song.likedBy;
	var liked = false;

	console.log(recipients);
	console.log('addedBy');
	console.log(req.song.addedBy);

	for(var i=0; i<recipients.length; i++) {
		if(req.song.addedBy.equals(recipients[i])) {
			liked = true;
			break;
		}
	}

	if(liked === false) {
		recipients.push(req.song.addedBy);
	}

	console.log(recipients);

	updateCreateMulti(req.io, req.user._id, req.params.songId, 'like', req.song.title, recipients, req.params.sharedId, req.song.likedBy.length);

	res.status(200).end();

};


/*==========================================================
	FUNCTIONS
==========================================================*/



var updateCreateMulti = function(io, userId, subjectId, type, name, recipients, requestId, count) {

	Notification.find({subjectId: subjectId, type: type}, function(err, notif) {
		// if notification exists for user, edit it

		if(notif.length) {
			for(var i=0; i < notif.length; i++) {

				if(userId.equals(notif[i].userId)) continue;

				if(!notif[i].viewed && (notif[i].type === 'new_song' || notif[i].type === 'approval_member')) {
					console.log('not viewed, new_song or approval_member');
					notif[i].sender = userId;
					notif[i].viewed = false;
					if(count) {
						notif[i].participantNum = count;
					} else {
						notif[i].participantNum += 1;
					}
					notif[i].save();
					var a = recipients.some(function (user, index) {
				    	if(user.equals(notif[i].userId)) return index;
					});
					recipients.splice(a, 1);

				} else if(notif[i].type != 'new_song' && notif[i].type != 'approval_member') {
					console.log('not new_song or approval_member');
					if(notif[i].viewed === true) {
						io.to(notif[i].userId).emit(type);
						// update user
						User.update(
							{_id: notif[i].userId},
							{$inc: {notifCount: 1}},
							function() {}
						);
					}

					var a = recipients.some(function (user, index) {
				    	if(user.equals(notif[i].userId)) return index;
					});
					recipients.splice(a, 1);

					notif[i].sender = userId;
					notif[i].viewed = false;
					if(count) {
						notif[i].participantNum = count;
					} else {
						notif[i].participantNum += 1;
					}
					notif[i].save();
				}

			}
		}

		// if notification does not exist, create a new one.
		if(recipients.length > 0) {
			console.log('create new notification');
			for(var j=0; j < recipients.length; j++) {
				if(userId.equals(recipients[j])) {
					continue;
				}
				io.to(recipients[j]).emit(type);
				var newNotif = new Notification({
					type: type,
					sender: userId,
					userId: recipients[j],
					subjectId: subjectId,
					requestId: requestId,
					participantNum: count,
					playlistName: name
				});
				newNotif.save(function(err, notif) {
					User.update(
						{_id: notif.userId},
						{$inc: {notifCount: 1}},
						function() {}
					);
				});

			}
		}
	});
};

var updateCreateSingle = function(io, userId, subjectId, type, playlistName, recipient, requestId) {
	Notification.findOne({userId: recipient, subjectId: subjectId, type: type}, function(err, notif) {
		if(notif) var viewed = notif.viewed;
		
		if(notif && !viewed && (notif.type === 'new_song' || notif.type === 'approval_member')) {
			notif.sender = userId;
			notif.participantNum += 1;
			notif.save();
		} else if(notif && notif.type != 'new_song' && notif.type != 'approval_member') {
			notif.sender = userId;
			notif.participantNum += 1;
			notif.save();
			if(viewed === true) {
				io.to(notif.userId).emit(type);
				User.update(
					{_id: notif.userId},
					{$inc: {notifCount: 1}},
					function() {}
				);
			}
		} else {
			var newNotif = new Notification({
				type: type,
				sender: userId,
				userId: recipient,
				subjectId: subjectId,
				requestId: requestId,
				playlistName: playlistName
			});
			io.to(newNotif.userId).emit(type);
			newNotif.save(function(err, savedNotif) {
				//push to user
				User.update(
					{_id: savedNotif.userId},
					{$inc: {notifCount: 1}},
					function(){}
				);
			});
		}

	});
};

var removeNotification = function(userId, playlistId, type) {
	Notification.findOne({userId: userId, subjectId: playlistId, type: type}, function(err, notif) {
		notif.remove();
	});
};

var removeAllNotifications = function(subjectId) {
	Notification.find({subjectId: subjectId}, function(err, notif) {
		for(var i=0; i < notif.length; i++) {
			User.update(
				{_id: notif[i].userId},
				{$pull: {notifications: notif[i]._id}}	
			);
			notif[i].remove();
		}
	});
};

var removeUserNotifications = function(userId, playlistId) {
	Notification.find({userId: userId, subjectId: playlistId})
				.remove()
				.exec();
};
