'use strict';

// Load module dependencies
var config = require('./config'),
	http = require('http'),
	socketio = require('socket.io'),
	express = require('express'),
	morgan = require('morgan'),
	compress = require('compression'),
	bodyParser = require('body-parser'),
	methodOverride = require('method-override'),
	session = require('express-session'),
	MongoStore = require('connect-mongo')(session),
	passport = require('passport');

module.exports = function(db) {
	var app = express();

	var server = http.createServer(app);

    var io = socketio.listen(server);

	console.log(process.env.NODE_ENV);

	// Use the 'NODE_ENV' variable to activate the morgan logger, or compress middleware
	if(process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
		app.use(morgan('dev'));
	} else if (process.env.NODE_ENV === 'production') {
		app.use(compress());
	}

	// Use the bodyParser and methodOverride functions
	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(bodyParser.json());
	app.use(methodOverride());

	var mongoStore = new MongoStore({
       	db: db.connection.db
	});
		//configure the 'session' middleware
	app.use(session({
		saveUninitialized: true,
		resave: true,
		secret: config.sessionSecret,
		store: mongoStore
	}));

	app.use(errorHandler);
	function errorHandler(err, req, res, next) {
		res.status(500);
		res.send('error', {error: err});
	};

	// Set the application view engine and 'views' folder
	app.set('views', process.cwd() + '/core/server/views');
	app.set('view engine', 'ejs');

	// Configure the Passport middleware
	app.use(passport.initialize());
	app.use(passport.session());

	// Load the routing files
	require('../routes/users.server.routes.js')(app);
	require('../../../playlists/server/playlists.server.routes')(app);
	require('../../../events/server/events.server.routes')(app);
	require('../../../sharedPlaylists/server/routes/sharedplaylists.server.routes')(app, io);

	// Configure static file serving
	app.use(express.static('./core/public'));
	app.use(express.static('./core/public/js/Modules/Player'));
	app.use(express.static('./core/public/js/Modules/Popup'));
	app.use(express.static('./playlists/public'));
	app.use(express.static('./events/public'));
	app.use(express.static('./sharedPlaylists/public'));
	app.use(express.static('./friends/public'));
	app.use(express.static('./guest'));

	app.use(function(req, res, next) {
		res.status(400);
     	res.render('404.ejs', {title: '404: File Not Found'});
	});

	require('./socketio')(server, io, mongoStore);
	return server;
};