'use strict';

//Load module dependencies
var User = require('mongoose').model('User'),
	LibraryItem = require('mongoose').model('LibraryItem'),
	passport = require('passport');


exports.scrollAdd = function(req, res, next) {
	var regex = new RegExp(req.query.str, 'i'); 
	LibraryItem.find({userId: req.user._id, title: regex})
		.sort(req.query.sort)
		.skip(Number(req.query.num))
		.limit(Number(100))
		.exec(function(err, scrollItems) {
			res.json(scrollItems);
		});

};

exports.searchList = function(req, res, next) {
	var regex = new RegExp(req.query.str, 'i');
	console.log(regex); 
	LibraryItem.find({userId: req.user._id, title: regex})
		.sort(req.query.sort)
		.limit(100)
		.exec(function(err, searchList) {
			res.json(searchList);
		});
};

exports.order = function(req, res, next) {
	var regex = new RegExp(req.query.str, 'i'); 
	console.log(regex); 
	LibraryItem.find({userId: req.user._id, title: regex})
		.sort(req.query.sort)
		.limit(100)
		.exec(function(err, orderList) {
			res.json(orderList);
		});
};

/*================================================
	SIZE / PERFORMANCE TEST ROUTES
================================================*/


exports.fillLibrary = function(req, res, next) {

		function makeword(){
		    var text = "";
		    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		    for( var i=0; i < 5; i++ )
		        text += possible.charAt(Math.floor(Math.random() * possible.length));

		    return text;
	    }

		for(var i=0; i < 500; i++) {


			var libraryItem = new LibraryItem({
				userId: req.user._id,
				title: makeword(),
				artist: makeword()
			});

			libraryItem.save(function(err, libraryItem) {
				if(err) return next(err);
				req.user.library.push(libraryItem._id);
				req.user.save(function(err, user) {
					if(err) return next(err);
					
					
				});
			});

	    }
}


