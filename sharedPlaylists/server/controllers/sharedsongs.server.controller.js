'use strict';

var SharedSong = require('mongoose').model('SharedSong'),
	SharedPlaylist = require('mongoose').model('SharedPlaylist'),
	LibraryItem = require('mongoose').model('LibraryItem'),
	User = require('mongoose').model('User'),
	passport = require('passport');


/*==========================================================
	Operations
==========================================================*/

exports.add = function(req, res, next) {
	var sharedSong = new SharedSong(req.body);
	sharedSong.playlistId = req.params.sharedId;
	sharedSong.addedBy = req.user._id;
	saveToLibrary(req.body, req.user);
	sharedSong.save(function(err, song) {
		req.playlist.songs.push(song._id);
		req.song = song;
		req.playlist.save(function(err, playlist) {
			req.playlist = playlist;
			next();
		});
	});
};

exports.dragto = function(req, res, next) {
	var sharedSong = new SharedSong(req.body);
	sharedSong.playlistId = req.params.sharedId;
	sharedSong.addedBy = req.user._id;
	sharedSong.save(function(err, song) {
		req.playlist.songs.push(song._id);
		req.song = song;
		req.playlist.save(function(err, playlist) {
			req.playlist = playlist;
			next();
		});
	});
};

exports.get = function(req, res, next) {
	SharedSong.findById(req.params.songId, function(err, song) {
		if(err) return next(err);
		req.song = song;
		next();
	});
};

exports.send = function(req, res, next) {
	res.json(req.song);
};

exports.edit = function(req, res, next) {
	SharedSong.findOneAndUpdate(
		{_id: req.params.songId},
		{
			title: req.body.title,
			artist: req.body.artist
		},
		function(err, song) {
			if(err) return next(err);
			res.json(song);
		}
	);
};

exports.delete = function(req, res, next) {
	req.song.remove(function(err) {
		if(err) return next(err);
		SharedPlaylist.update(
			{_id: req.params.sharedId},
			{$pull: {songs: req.params.songId}}	
		);
		next();
	});
};

exports.populateSongs = function(req, res, next) {
	SharedSong.find({playlistId: req.params.sharedId})
			.sort('-added')
			.limit(50)
			.populate({path: 'addedBy', select: 'fullName photoUrl'})
			.exec(function(err, songs) {
				if(err) return next(err);
				res.json({playlist: req.playlist, songs: songs});
			});
};

exports.searchList = function(req, res, next) {
	var regex = new RegExp(req.query.str, 'i');
	SharedSong.find({playlistId: req.params.sharedId, title: regex})
			.sort(req.query.sort)
			.limit(50)
			.populate({path: 'addedBy', select: 'fullName photoUrl'})
			.exec(function(err, searchList) {
				if(err) return next(err);
				res.json(searchList);
			});
};

/*==========================================================
	Comments
==========================================================*/


exports.getComments = function(req, res, next) {

	SharedSong.populate(req.song, {
		path: 'comments.user',
		select: 'photoUrl fullName',
		model: User
	}, function(err, song) {
		if(err) return next(err);
		res.json(song);
	});

};

exports.addComment = function(req, res, next) {

	var comment = {
		comment: req.body.comment,
		user: req.user._id
	};
	req.song.comments.push(comment);

	var commented = false;

	for(var i=0; i<req.song.commenters.length; i++) {
		if(req.user._id.equals(req.song.commenters[i])) {
			commented = true;
			break;
		}
	}
	if(commented === false) req.song.commenters.push(req.user._id);
	req.song.save(function(err, song) {
		if(err) return next(err);
		next();
	});
};

/*==========================================================
	Like
==========================================================*/

exports.addLike = function(req, res, next) {
	var liked = false;
	for(var i=0; i<req.song.likedBy.length; i++) {
		if(req.user._id.equals(req.song.likedBy[i])) {
			liked = true;
			break;
		}
	}

	if(liked == false) req.song.likedBy.push(req.user._id);

	req.song.save(function(err, song) {
		if(err) return next(err);
		next();
	});

};
 
/*==========================================================
	Permissions
==========================================================*/

exports.authorCheck = function(req, res, next) {
	if(req.user._id.equals(req.song.addedBy)) {
		next();
	} else {
		res.json('permissions_failure');
	}
};

/*==========================================================
	Functions
==========================================================*/

var saveToLibrary = function(songDetails, user) {
	var libraryItem = new LibraryItem(songDetails);
	libraryItem.save(function(err, song) {
		user.library.push(libraryItem._id);
		var present = false;
		for(var i=0; i<user.artistList.length; i++) {
			if(user.artistList[i].name === libraryItem.artist) {
				present = true;
				break;
			}
		}
		if (!present) user.artistList.push({name: libraryItem.artist});
		user.save();
	});
}
