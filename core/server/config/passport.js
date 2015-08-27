'use strict';

var passport = require('passport'),
	mongoose = require('mongoose');

module.exports = function() {
	var User = mongoose.model('User');

	// Use Passports 'serializeUser' method to serialize the user id
	passport.serializeUser(function(user, done) {
  		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
  		User.findById(id, function(err, user) {
    		done(err, user);
  		});
	});

	require('./strategies/facebook.js')();
}