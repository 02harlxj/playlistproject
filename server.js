'use strict';

// Set 'NODE_ENV' variable, if not set already
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// load module configured dependencies
var config = require('./core/server/config/config'),
	mongoose = require('./core/server/config/mongoose'),
	express = require('./core/server/config/express'),
	passport = require('./core/server/config/passport');

// Create new mongoose instance
var db = mongoose();

// Create new express instance
var app = express(db);

// Create new passport middleware
var passport = passport();

// Use the Express app instance to listen on port '3000'
app.listen(config.port);

console.log('Server running on port ' + config.port);

// Use the module.exports property to expose the Express application for external use
module.exports = app;
