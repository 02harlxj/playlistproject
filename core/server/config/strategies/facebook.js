var passport = require('passport'),
	url = require('url'),
	FacebookStrategy = require('passport-facebook').Strategy,
	config = require('../config'),
	users = require('../../controllers/users.server.controllers');

module.exports = function() {
	passport.use(new FacebookStrategy({
		clientID: config.facebook.clientID,
		clientSecret: config.facebook.clientSecret,
		callbackURL: config.facebook.callbackURL,
		profileFields: ['id', 'first_name', 'last_name', 'locale', 'displayName', 'picture'],
		passReqToCallback: true
	},
	function(req, accessToken, refreshToken, profile, done) {

		var providerData = profile._json;
		providerData.accessToken = accessToken;
		providerData.refreshToken = refreshToken;

		var providerUserProfile = {
			firstName: profile.name.givenName,
			lastName: profile.name.familyName,
			fullName: profile.displayName,
			photoUrl: profile.photos[0].value,
			provider: 'facebook',
			providerId: profile.id,
			providerData: providerData
		};
		
		users.saveOAuthUserProfile(req, providerUserProfile, done);
	}));
};