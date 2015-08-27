SharedPlaylist.controller('NotificationCtrl', ['$scope', '$state', 'Socket', 'NotificationService', 'SharedSongService', 
	function($scope, $state, Socket, NotificationService, SharedSongService){
	$scope.notifications = [];
	NotificationService.get(function(notifs) {
		$scope.notifications = notifs;
	});

	$scope.notifShow = function(notif) {
		// set viewed to true
		NotificationService.markAsViewed(notif);
		console.log(notif);
		// individual notif actions
		switch(notif.type) {
			case 'comment':
				showComment(notif.requestId, notif.subjectId);
				break;
			case 'like': 
				showPlaylist(notif.requestId);
				break;
			case 'new_song':
				showPlaylist(notif.subjectId);
				break;
			case 'approval_member':
				approve(notif.requestId);
				break;
			case 'invite':
				joinPlaylist(notif.subjectId);
				break;
			case 'madeAdmin':
				showPlaylist(notif.subjectId);
				break;
		}
	};

	var joinPlaylist = function(playlistId) {
		$state.go('joinplaylist', {playlistId: playlistId}, {reload: true});
	};

	var showPlaylist = function(playlistId) {
		$state.go('sharedplaylist', {playlistId: playlistId}, {reload: true});
	};

	var showComment = function(playlistId, songId) {
		$state.go('sharedplaylist', {playlistId: playlistId}).then(function() {
			var unbindWatcher = $scope.$watch('playlist', function() {
				SharedSongService.get(playlistId, songId, function(song) {
					console.log(song);
					$scope.a.commenting = song;
					$scope.a.sidebarview = 'comments';
				});
				unbindWatcher();
			});
		});
	};

	var approve = function(requestId) {
		console.log(requestId);
		$state.go('sharedplaylist', {playlistId: requestId}).then(function() {
			var unbindWatcher = $scope.$watch('playlist', function() {
				$scope.a.sidebarview = 'approval';
				unbindWatcher();
			});
		});
	}

}]);