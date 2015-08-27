var MainApp = angular.module('MainApp', ['ngResource', 'ngAnimate', 'ui.router', 'PlayerModule'])
.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {
	$locationProvider.html5Mode(true);
	$urlRouterProvider.otherwise('/guest/tour');
	$stateProvider
		.state('tour', {
			url: '/guest/tour',
			templateUrl: '/pages/tour.html',
			controller: 'TourCtrl'
		})
		.state('userprofile', {
			url: '/guest/user/:userId',
			templateUrl: '/partials/profile.html',
			controller: 'GuestProfileCtrl'
		})
		.state('userplaylist', {
			url: '/guest/playlist/:playlistId',
			templateUrl: '/partials/viewUsersPlaylist.html',
			controller: 'GuestPlaylistCtrl'
		})
		.state('sharedplaylistguest', {
			url: '/guest/sharedplaylist/:playlistId',
			templateUrl: '/partials/viewSharedPlaylist.html',
			controller: 'GuestSharedPlaylistCtrl'
		});
}])
.controller('GuestCtrl', ['$scope', function($scope){
	$scope.a = [];
	$scope.display = {
		tour: false
	};
}])
.controller('TourCtrl', ['$scope', function($scope){
	$scope.display.tour = true;
	alert($scope.tour);
}])

.controller('GuestProfileCtrl', ['$scope', '$location', '$http', 'GetId', function($scope, $location, $http, GetId) {
	var path = GetId.fromPath($location.path());
	console.log(path);
	$http.get('/api/friend/' + path)
		.success(function(friend) {
			console.log(friend);
			$scope.friend = friend;
		});
}])
.controller('GuestPlaylistCtrl', ['$scope', '$http', '$location', 'GetId', function($scope, $http, $location, GetId){
	var playlistId = GetId.fromPath($location.path());
	var userId = GetId.fromPath(GetId.firstPath($location.path(), 'playlist'));
	$http.get('api/otheruser/guest/playlist/' + playlistId)
		.success(function(playlist) {
			if(playlist === 'private') {
				$scope.private = true;
			} else {
				$scope.private = false;
				$scope.playlist = playlist;
				for(var i=0, a=playlist.songs.length; i<a; i++) {
					$scope.playlist.songs[i].playlistId = 'users';
				}
			}
		});
}])
.controller('GuestSharedPlaylistCtrl', ['$scope', '$location', '$http', 'GetId', function($scope, $location, $http, GetId) {
	var sharedId = GetId.fromPath($location.path());
	$scope.pending = null;
	$http.get('/api/shared/' + sharedId + '/guest')
		.success(function(data) {
			if(data === 'permissions_failure') {
				$scope.private = true;
			} else {
				console.log(data);
				$scope.private = false;
				data.playlist.songs = data.songs;
				$scope.playlist = data.playlist;
			}
		});

}]);