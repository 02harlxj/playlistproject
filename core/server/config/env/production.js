module.exports = {
	db: 'mongodb://heroku_fdxpm4mf:fr0b51hqm5c98683a73vftgvdv@ds035280.mongolab.com:35280/heroku_fdxpm4mf',
	sessionSecret: 'q23w4e45r5t66y78u8htrdty234567',
	port: process.env.PORT || 8080,
	facebook: {
		clientID: '829830930409829',
		clientSecret: '6da2b0682c9be14191aa7f6229cfe858',
		callbackURL: 'http://dry-savannah-3864.herokuapp.com/oauth/facebook/callback'
	}
}