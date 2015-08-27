var MainApp = angular.module('MainApp', ['ngResource', 'ngAnimate', 'ngDraggable','ui.router', 'SocketModule', 'Playlist', 'SharedPlaylist', 'PopupModule', 'PlayerModule', 'EventsModule', 'SpinnerModule', 'Friends'])
.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {
	$locationProvider.html5Mode(true);
	$urlRouterProvider.otherwise('/library');
	$stateProvider
		.state('library', {
			url: '/library',
			templateUrl: '/partials/library.html',
			controller: 'LibraryCtrl'
		});
}]);