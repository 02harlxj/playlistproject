var EventsModule = angular.module('EventsModule', [])
.controller('EventsCtrl', ['$scope', 'EventService', 'ArtistService', 'Popup', 'ContentLoaded', function($scope, EventService, ArtistService, Popup, ContentLoaded) {
	$scope.artistStr = '';
	$scope.location = 'Manchester';
	$scope.page = 1;
	$scope.month = '';

	$scope.events = [];

	var createStr = function() {
		var number = ($scope.user.artistList.length > 50) ? 50: $scope.user.artistList.length;
		for(var x=0; x < $scope.user.artistList.length; x++) {
			$scope.artistStr = $scope.artistStr + '&artists[]=' + $scope.user.artistList[x].name;
		}
		EventService.getEvents($scope.artistStr, $scope.location, $scope.page, function(data, date) {
			$scope.current_date = date;
			$scope.events = data;
			ContentLoaded.loaded();
		});
	}();

	$scope.nextMonth = function() {
		$scope.page = 1;
		EventService.nextMonth($scope.artistStr, $scope.location, $scope.page, function(data, date) {
			$scope.current_date = date;
			$scope.events = data;
		});
	};

	$scope.prevMonth = function() {
		$scope.page = 1;
		EventService.prevMonth($scope.artistStr, $scope.location, $scope.page, function(data, date) {
			$scope.current_date = date;
			$scope.events = data;
		});
	};

	$scope.prevPage = function() {
		$scope.page -= 1;
		EventService.getPage($scope.artistStr, $scope.location, $scope.page, function(data, date) {
			$scope.current_date = date;
			$scope.events = data;
		});
	};
	$scope.nextPage = function() {
		$scope.page += 1;
		EventService.getPage($scope.artistStr, $scope.location, $scope.page, function(data, date) {
			$scope.current_date = date;
			$scope.events = data;
		});
	};

	$scope.addArtist = function(name) {
		ArtistService.addArtistToList(name, function(artistList) {
			$scope.user.artistList = artistList.response;
		});
	};
	$scope.renameArtist = function(artist, newName) {
		ArtistService.editArtistInList(artist._id, newName, function() {
			artist.name = newName;
		});
	};
	$scope.removeArtist = function(artist) {
		Popup.makeSure('delete', artist.name, function(bool) {
    		if(bool) {
    			ArtistService.removeArtistFromList(artist._id, function() {
					var a = $scope.user.artistList.indexOf(artist);
    				$scope.user.artistList.splice(a, 1);
				});
    		};
    	});
	};
}])

.service('ArtistService', ['$resource', function($resource){
	var Artist = $resource('/api/user/:userId/artistlist/:artistId', 
						{userId: userId, artistId: '@id'},
						{'save': {method: 'POST', isArray: false }});
	this.addArtistToList = function(name, callback) {
		var newArtist = new Artist({name: name});
		newArtist.$save({},function(data) {
			callback(data);
		});
	};
	this.removeArtistFromList = function(id, callback) {
		Artist.remove({artistId:id}, function() {
			callback();
		});
	};
	this.editArtistInList = function(id, newName, callback) {
		Artist.save({artistId:id}, {name: newName}, function() {
			callback();
		});
	};
}])

.directive('artistList', ['$timeout', function($timeout){
	// Runs during compile
	return {
		restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
		template: '<li><span>{{artist.name}}</span><input type="text" ng-init="newName = artist.name" ng-model="newName" ng-enter="renameArtist(artist, newName)"/><div class="options"><div class="edit" ng-click="showRenameArtist(artist)"></div><div class="delete" ng-click="removeArtist(artist)"></div></div></li>',
		replace: true,
		link: function($scope, iElm, iAttrs, controller) {
			iElm.on('mouseenter', function() {
				iElm.addClass('show');
			});
			iElm.on('mouseleave', function() {
				iElm.removeClass('show');
				if(iElm.hasClass('edit')) {
					iElm.removeClass('edit');
				}
			});
			$timeout(function () {
	            iElm.on('click', function (evt) {
		            var isEdit = (evt.srcElement.className === 'edit');
		            if (isEdit) {
		            	iElm.addClass('edit');
		            }
		        });
	        });
		}
	};
}])

.factory('EventService', ['$http', 'dateRange', function($http, dateRange) {

	var getEvents = {};

	getEvents.nextMonth = function(artists, location, page, callback) {
		dateRange.nextMonth();
		$http.jsonp('http://api.bandsintown.com/events/search?app_id=MusicCenter' + artists + '&location=' + location + '&page=' + page + '&date=' + dateRange.rangeStr + '&per_page=50&format=json&callback=JSON_CALLBACK')
			.success(function(data) {
				callback(data, dateRange.upper);
			});
	};

	getEvents.prevMonth = function(artists, location, page, callback) {
		dateRange.prevMonth();
		$http.jsonp('http://api.bandsintown.com/events/search?app_id=MusicCenter' + artists + '&location=' + location + '&page=' + page + '&date=' + dateRange.rangeStr + '&per_page=50&format=json&callback=JSON_CALLBACK')
			.success(function(data) {
				callback(data, dateRange.upper);
			});
	};

	getEvents.getEvents = function(artists, location, page, callback) {
		dateRange.initMonth();
		$http.jsonp('http://api.bandsintown.com/events/search?app_id=MusicCenter' + artists + '&location=' + location + '&page=' + page + '&date=' + dateRange.rangeStr + '&per_page=20&format=json&callback=JSON_CALLBACK')
			.success(function(data) {
				callback(data, dateRange.upper);
			});
	};

	getEvents.getPage = function(artists, location, page, callback) {
		$http.jsonp('http://api.bandsintown.com/events/search?app_id=MusicCenter' + artists + '&location=' + location + '&page=' + page + '&date=' + dateRange.rangeStr + '&per_page=20&format=json&callback=JSON_CALLBACK')
			.success(function(data) {
				callback(data, dateRange.upper);
			});
	};

	return getEvents;

}])
.factory('dateRange', function() {

	var dateRange = {}

	dateRange.dateNow = '';
	dateRange.rangeStr = '';

	dateRange.upper = '';
	dateRange.lower = '';


	dateRange.calcString = function() {
		dateRange.rangeStr = dateRange.lower.getFullYear() + '-' 
							+ ('0' + (Number(dateRange.lower.getMonth()) + 1)).slice(-2) + '-'
							+ ('0' + dateRange.lower.getDate()).slice(-2) + ','
							+ dateRange.upper.getFullYear() + '-' 
							+ ('0' + (Number(dateRange.upper.getMonth()) + 1)).slice(-2) + '-'
							+ ('0' + dateRange.upper.getDate()).slice(-2);
	};


	dateRange.initMonth = function() {
		var t = new Date();

		// Set current date
		dateRange.dateNow = t;

		var d = new Date(t.getFullYear(), t.getMonth() + 1, 0, 23, 59, 59);

		// set current date range upper and lower bounds
		dateRange.upper = d;
		dateRange.lower = t;

		// set current date range string
		dateRange.calcString();

	};

	dateRange.nextMonth = function() {
		dateRange.lower = dateRange.upper;
		dateRange.upper = new Date(dateRange.upper.getFullYear(), dateRange.upper.getMonth() + 2, 0, 23, 59, 59);
		this.calcString();
	};

	dateRange.prevMonth = function() {

		var upperCheck = dateRange.lower;
		var lowerCheck = new Date(dateRange.upper.getFullYear(), dateRange.upper.getMonth() - 1, 0, 23, 59, 59);

		if(dateRange.dateNow < lowerCheck) {
			// fine
			dateRange.upper = upperCheck;
			dateRange.lower = lowerCheck;
		} else {
			// now
			dateRange.lower = dateRange.dateNow;
			dateRange.upper = new Date(dateRange.dateNow.getFullYear(), dateRange.dateNow.getMonth() + 1, 0, 23, 59, 59);
		}
		dateRange.calcString();
	};

	return dateRange;
})
.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {
	$stateProvider
		.state('events', {
			url: '/events',
			templateUrl: '/partials/events.html',
			controller: 'EventsCtrl'
		});
}]);
