SharedPlaylist.controller('SettingsCtrl', ['$scope', 'SharedPlaylistService', function($scope, SharedPlaylistService){
	$scope.settings = {
		name: $scope.playlist.name,
		memberAdd: $scope.perms.memberAdd,
		songAdd: $scope.perms.songAdd,
		songDelete: $scope.perms.songDelete,
		private: $scope.playlist.settings.private
	};
	console.log($scope.settings);

	$scope.update = function(data) {
		var settings = $scope.playlist.settings;

		var name = data.name;

		settings.desc = data.desc;
		settings.private = data.private;
		settings.permissions.memberAdd = data.memberAdd;

		SharedPlaylistService.updateSettings(settings, name, $scope.playlist._id, function(playlist) {
			$scope.hideSidebar();
			if(playlist === 'permissions_failure') return;
			$scope.playlist = playlist;
			$scope.perms = playlist.settings.permissions;

			for(var i=0; i<$scope.user.sharedPlaylists.length; i++) {
				if($scope.user.sharedPlaylists[i]._id === playlist._id) {
					$scope.user.sharedPlaylists[i].name = playlist.name;
				}
			}
		});
	};
}]);