'use strict';

// require the correct config file for the currently set environment
module.exports =  require('./env/' + process.env.NODE_ENV + '.js');