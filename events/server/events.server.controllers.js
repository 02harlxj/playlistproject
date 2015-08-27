'use strict';

var	User = require('mongoose').model('User'),
	passport = require('passport');

exports.addNewArtist = function(req, res, next) {
	req.user.artistList.push(req.body);
	req.user.save(function(err, user) {
		if(err) return next(err);
		var response = {
			response: user.artistList
		}
		res.json(response);
	});
};

exports.renameArtist = function(req, res, next) {
	var artist = req.user.artistList.id(req.params.artistId);
	artist.name = req.body.name;
	req.user.save(function(err, user) {
		if(err) return next(err);
		res.json(artist);
	});
};

exports.removeArtist = function(req, res, next) {
	var artist = req.user.artistList.id(req.params.artistId);
	artist.remove();
	req.user.save(function(err, user) {
		if(err) return next(err);
		res.json(artist);
	});
};