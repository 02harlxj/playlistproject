'use strict';

// Set the 'development environment config file'
module.exports = {
	db: 'mongodb://localhost/testenviro',
	store: 'mongodb://localhost/mongoStore',
	sessionSecret: 'justaTest',
	port: 3000,
	facebook: {
		clientID: '829830930409829',
		clientSecret: '6da2b0682c9be14191aa7f6229cfe858',
		callbackURL: 'http://localhost:3000/oauth/facebook/callback'
	}
}