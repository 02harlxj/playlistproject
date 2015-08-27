'use strict';

var Playlist = require('mongoose').model('Playlist'),
	User = require('mongoose').model('User'),
	LibraryItem = require('mongoose').model('LibraryItem'),
	passport = require('passport');

exports.addSongToPlaylist = function(req, res, next) {
	Playlist.findById(req.params.playlistId, function(err, playlist) {
		if(err) return next(err);
		req.body.userId = req.user._id;
		var libraryItem = new LibraryItem(req.body);
		libraryItem.save(function(err, song) {
			console.log(song);
			var order = playlist.songs.length + 1;
			var newSong = {
				_id: song._id,
				provider: song.provider,
				videoId: song.videoId,
				title: song.title,
				artist: song.artist,
				added: song.added,
				order: order
			};
			playlist.songs.push(newSong);
			playlist.save(function(err, playlist) {
				console.log(playlist.songs);
				req.user.library.push(libraryItem._id);
				var present = false;
				for(var i=0; i<req.user.artistList.length; i++) {
					if(req.user.artistList[i].name === libraryItem.artist) {
						present = true;
						break;
					}
				}
				if (!present) req.user.artistList.push({name: libraryItem.artist});
				console.log(req.user);
				
				req.user.save(function(err, user) {
					if(err) return next(err);
					res.json(newSong);
				});
			})
		});
	});
};

exports.dragSongToPlaylist = function(req, res, next) {
	Playlist.findById(req.params.playlistId, function(err, playlist) {
		if(err) return next(err);
		if(playlist.songs.id(req.body._id) == null) {
			req.body.order = playlist.songs.length + 1;
			playlist.songs.push(req.body);
			playlist.save(function(err, playlist) {
				if (err) return next(err);
			});
		}
	});
};

exports.updateSongs = function(req, res, next) {
	Playlist.findById(req.params.playlistId, function(err, playlist) {
		if(err) return next(err);
		if(playlist) {
			playlist.songs = req.body;
			playlist.save(function(err, playlist) {
				if (err) return next(err);
				res.json(playlist);
			});	
		}
	});
};







