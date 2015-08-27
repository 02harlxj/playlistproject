'use strict';

//Load module dependencies
var User = require('mongoose').model('User'),
	Playlist = require('mongoose').model('Playlist'),
	LibraryItem = require('mongoose').model('LibraryItem'),
	passport = require('passport');


// Create User
exports.saveOAuthUserProfile = function(req, profile, done) {
	User.findOne({
		provider: profile.provider,
		providerId: profile.providerId
	}, function(err, user) {
		if(err) {
			return done(err);
		} else {
			if(!user) {
				var username = profile.username || ((profile.email) ? profile.email.split('@')[0] : '');
				profile.username = username;

				user = new User(profile);

				user.save(function(err) {
					if(err) {
						return done(err);
					}
					return done(err, user);
				});

			} else {
				return done(err, user);
			}
		}
	});
};

// Signout
exports.signout = function(req, res) {
	console.log('logout');
	// Use the Passport 'logout' method to logout
	req.logout();

	// Redirect to login page
	res.redirect('/tour');
};

/*===========================================
	USER API METHODS
===========================================*/

exports.checkAuth = function(req, res, next) {
	if(req.user._id == req.params.id) {
		next();
	} else {
		res.json('Not Authorized');
	}

};

exports.getUser = function(req, res, next) {
	User.findById(req.user._id)
		.populate('playlists', 'name')
		.populate('sharedPlaylists', 'name')
		.populate({
			path:'library',
			options: { limit: 100, sort: {'added': -1} }
		})
		.exec(function(err, user) {
		if(err) return next(err);
		res.json(user);
	});
};

exports.getFriend = function(req, res, next) {
	User.findById(req.params.friendId)
		.populate({
			path:'playlists', 
			select: 'name',
			match: { private: false }
		})
		.populate({
			path:'sharedPlaylists', 
			select: 'name',
			match: { 'settings.private': false }
		})
		.populate({
			path:'library',
			options: { limit: 10, sort: {'added': -1} }
		})
		.exec(function(err, user) {
		if(err) return next(err);
		res.json(user);
	});
};

exports.getFriends = function(req, res, next) {


	User.find({providerId: {$in: req.body}})
		.select('fullName photoUrl')
		.exec(function(err, users) {
		console.log(users);
		res.json(users);
	});

};

exports.changeDetails = function(req, res, next) {

	req.user.firstName = req.body.firstName;
	req.user.lastName = req.body.lastName;

	req.user.save(function(err, user){
		if(err) res.json(err);
		res.json(user);
	});
};

exports.deleteaccount = function(req, res, next) {
	// Delete the account
	req.user.remove(function(err) {

		// if delete error, move to next() middleware
		if(err) return next(err);
		
		// Redirect to login page
		return res.redirect('/tour');
	});
};

exports.search = function(req, res, next) {
	User.find({fullName: new RegExp(req.query.str, "i")})
		.limit(20)
		.exec(function(err, users) {
			if(err) return(err);
			res.json(users);
		});
};

/*===========================================
	LIBRARY API
===========================================*/

exports.addSongToLibrary = function(req, res, next) {
	req.body.songDetails.userId = req.user._id;
	var libraryItem = new LibraryItem(req.body.songDetails);
	libraryItem.save(function(err, libraryItem) {
		if(err) return next(err);
		req.user.library.push(libraryItem._id);
		console.log(req.user.library);
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
			console.log(libraryItem);
			res.json(libraryItem);
		});
		
	});

};

exports.removeSongFromLibrary = function(req, res, next) {
	LibraryItem.findById(req.params.songId, function(err, libraryItem) {
		if(err) return next(err);
		req.params.songId = req.params.songId;
		libraryItem.remove();
		User.update(
			{_id: req.user._id},
			{$pull: {library: libraryItem._id}},
			function(err, obj) {
				res.json(req.params.songId);
			}
		);
	});
};

exports.editSongDetails = function(req, res, next) {
	LibraryItem.findById(req.params.songId, function(err, libraryItem) {
		libraryItem.title = req.body.title;
		libraryItem.artist = req.body.artist;
		libraryItem.save(function(err, libraryItem) {
			if(err) return next(err);
			res.send(req.params.songId);
		});
	});
};

/*===========================================
	RENDER FUNCTIONS
===========================================*/

exports.renderHome = function(req, res, next) {
	// If a user is not signed in, redirect to '/tour' page. Else, redirect to '/tour' route.
	if(!req.user) {
		res.sendFile('pages/tour.html', {root: './core/server'});
	} else {
		res.render('home', {
			userId: req.user._id
		});
	}
};

exports.renderHomeOrGuest = function(req, res, next) {
	if(!req.user) {
		res.redirect('/guest' + req.originalUrl);
	} else {
		res.render('home', {
			userId: req.user._id
		});
	}
};

exports.renderGuest = function(req, res, next) {
	// If a user is not signed in, redirect to '/tour' page. Else, redirect to '/tour' route.
	if(!req.user) {
		res.render('guest');
	} else {
		// redirect - '/guest'
		res.redirect('/');
	}
};
