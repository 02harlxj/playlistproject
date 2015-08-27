'use strict';

var Playlist = require('mongoose').model('Playlist'),
	User = require('mongoose').model('User'),
	passport = require('passport');

exports.addNew = function(req, res, next) {
	var playlist = new Playlist({name: req.body.name, user: req.user._id});
	playlist.save(function(err, playlist) {
		if(err) return next(err);

		req.user.playlists.push(playlist._id);

		req.user.save(function(err, user){
			if(err) return next(err);
			res.json(playlist);
		});
	});
};

exports.getPlaylist = function(req, res, next) {
	Playlist.findById(req.params.playlistId, function(err, playlist) {
		if(err) return next(err);
		res.json(playlist);
	});
};

exports.getOthersPlaylist = function(req, res, next) {
	Playlist.findById(req.params.playlistId, function(err, playlist) {
		if(err) return next(err);
		Playlist.populate(playlist, {path: 'user', select: 'photoUrl fullName created'}, function(err, playlist) {
			if(err) return next(err);
			if(playlist.private) {
				res.json('private');
			} else {
				res.json(playlist);
			}
		});
	});
};

exports.guestViewPlaylist = function(req, res, next) {
	Playlist.findById(req.params.playlistId, function(err, playlist) {
		if(err) return next(err);
		Playlist.populate(playlist, {path: 'user', select: 'photoUrl fullName created'}, function(err, playlist) {
			if(err) return next(err);
			if(playlist.private) {
				res.json('private');
			} else {
				res.json(playlist);
			}
		});
	});
};

exports.renamePlaylist = function(req, res, next) {
	Playlist.findById(req.params.playlistId, function(err, playlist) {
		if(err) return next(err);
		playlist.name = req.body.name;
		playlist.save(function(err, playlist) {
			if(err) return next(err);
			res.json(playlist);
		});
	});
};

exports.setPrivacy = function(req, res, next) {
	req.playlist.private = req.body.privacy;
	req.playlist.save(function(err, playlist) {
		if(err) return next(err);
		res.json(playlist.private);
	});
};

exports.removePlaylist = function(req, res, next) {
	Playlist.findById(req.params.playlistId, function(err, playlist) {
		if(err) return next(err);
		playlist.remove();
		var a = req.user.playlists.indexOf(req.params.playlistId);
    	req.user.playlists.splice(a, 1);
    	req.user.save(function(err, user) {
    		if(err) return next(err);
    		console.log(req.params.playlistId);
			res.json(req.params.playlistId);
    	});
	});
};

exports.removeSongFromPlaylists = function(req, res, next) {
	var songId = req.params.songId;
	for(var i=0; i<req.user.playlists.length; i++) {
		Playlist.findById(req.user.playlists[i], function(err, playlist) {
			if(err) return next(err);
			var song = playlist.songs.id(songId);
			if(song) {
				var min = song.order;
				song.remove();

				for(var j=0; j<playlist.songs.length; j++) {
					if(playlist.songs[j].order > min) playlist.songs[j].order -= 1; 
				}
				// Redo order
				// loop over songs, 

				playlist.save();
			}
		});
	}
	next();
};

exports.editSongDetails = function(req, res, next) {
	for(var i=0; i<req.user.playlists.length; i++) {
		Playlist.findById(req.user.playlists[i], function(err, playlist) {
			if(err) return next(err);
			var song = playlist.songs.id(req.params.songId);
			if(song) {
				song.title = req.body.title;
				song.artist = req.body.artist;
				playlist.save();
			}
		});
	}
	next();
};

exports.checkAuth = function(req, res, next) {
	Playlist.findById(req.params.playlistId, function(err, playlist){
		if(err) return next(err);
		console.log(playlist);
		if(req.user._id.equals(playlist.user)) {
			req.playlist = playlist;
			next();
		} else {
			res.send({err: 'permissions failure', userId: playlist.user});
		}
	});
};





