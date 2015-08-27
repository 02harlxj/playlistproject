var SharedPlaylist = angular.module('SharedPlaylist', [])
.config(['$stateProvider', '$urlRouterProvider', '$locationProvider',function($stateProvider, $urlRouterProvider, $locationProvider) {
	$stateProvider
		.state('sharedplaylist', {
			url: '/sharedplaylist/:playlistId',
			templateUrl: '/partials/sharedplaylist.html',
			controller: 'SharedPlaylistCtrl'
		})
		.state('joinplaylist', {
			url: '/joinplaylist/:playlistId',
			templateUrl: 'partials/joinplaylist.html',
			controller: 'JoinPlaylistCtrl'
		});
}]);