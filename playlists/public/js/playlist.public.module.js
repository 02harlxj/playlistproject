var Playlist = angular.module('Playlist', [])
.config(['$stateProvider', '$urlRouterProvider', '$locationProvider',function($stateProvider, $urlRouterProvider, $locationProvider) {
	$stateProvider
		.state('playlist', {
			url: '/playlist/:playlistId',
			templateUrl: '/partials/playlist.html',
			controller: 'PlaylistCtrl'
		});
}]);