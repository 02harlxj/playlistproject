var Friends = angular.module('Friends', [])
.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {
	$stateProvider
		.state('friends', {
			url: '/friends',
			templateUrl: '/partials/friends.html',
			controller: 'FriendsCtrl'
		})
		.state('userplaylist', {
			url: '/user/:userId/playlist/:playlistId',
			templateUrl: '/partials/viewUsersPlaylist.html',
			controller: 'ViewUsersPlaylistCtrl'
		})
		.state('sharedplaylistguest', {
			url: '/shared/:playlistId/guest',
			templateUrl: '/partials/viewSharedPlaylist.html',
			controller: 'ViewSharedPlaylistCtrl'
		})
		.state('userprofile', {
			url: '/user/:userId/profile',
			templateUrl: '/partials/profile.html',
			controller: 'ProfileCtrl'
		});
}])
.controller('ProfileCtrl', ['$scope', '$location', '$http', 'GetId', 'ContentLoaded', function($scope, $location, $http, GetId, ContentLoaded) {
	var path = $location.path()
	path = path.substring(0, path.length-8);
	path = GetId.fromPath(path);
	$http.get('/api/friend/' + path)
		.success(function(friend) {
			$scope.friend = friend;
			ContentLoaded.loaded();
		});
}])
.controller('FriendsCtrl', ['$scope', '$http', 'FriendsService', 'ContentLoaded', function($scope, $http, FriendsService, ContentLoaded){

	$scope.rows = [];
	var set = [];
	FriendsService.getFriends($scope.user.providerData.accessToken, function(friendList) {
		for(var i=0; i < friendList.length; i++){
		   var friend = friendList[i];
		   set.push(friend);
		   if( (i+1) % 3 === 0 || (i+1) === friendList.length ){
		      $scope.rows.push(set);
		      set = [];
		   }
		}
		ContentLoaded.loaded();
	});
}])
.factory('FriendsService', ['$http', function($http) {
	FriendService = {};
	FriendService.list = '';
	FriendService.getFriends = function(accessToken, callback) {
		console.log(accessToken);
		$http.get('https://graph.facebook.com/v2.4/me/friends?access_token=' + accessToken)
			.success(function(data) {
				console.log(data);
				var ids = [];
				for(var i=0, a=data.data.length; i<a; i++) {
					ids.push(data.data[i].id);
				}
				FriendService.fetchFriends(ids, function(list){
					callback(list);
				});
			});
	};
	FriendService.fetchFriends = function(list, callback) {
		$http.post('/api/friends/find', list)
			.success(function(list){
				console.log(list);
				FriendService.list = list;
				callback(list);
			});
	};
	return FriendService;
}])
.controller('ViewUsersPlaylistCtrl', ['$scope', '$http', '$location', 'GetId', 'ContentLoaded', function($scope, $http, $location, GetId, ContentLoaded){
	var playlistId = GetId.fromPath($location.path());
	var userId = GetId.fromPath(GetId.firstPath($location.path(), 'playlist'));
	$http.get('api/otheruser/' + userId + '/playlist/' + playlistId)
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
			ContentLoaded.loaded();
		});
}])
.controller('ViewSharedPlaylistCtrl', ['$scope', '$location', '$http', 'GetId', 'SharedPlaylistService', 'ContentLoaded', 
	function($scope, $location, $http, GetId, SharedPlaylistService, ContentLoaded) {
	var path = $location.path()
	path = path.substring(0, path.length - 6);
	var playlistId = GetId.fromPath(path);
	$http.get('/api/shared/' + playlistId + '/guest')
		.success(function(data) {
			if(data === 'permissions_failure') {
				$scope.private = true;
			} else {
				$scope.private = false;
				data.playlist.songs = data.songs;
				$scope.playlist = data.playlist;

				if($scope.playlist.users_waiting_approval.toString().indexOf(userId) > -1) {
					$scope.pending = true;
				} else {
					$scope.pending = false;
				}
			}
			ContentLoaded.loaded();
		});

		$scope.requestJoin = function() {
			SharedPlaylistService.requestJoin(userId, $scope.playlist._id, function() {
				$scope.pending = true;
			});
		};
}]);