SharedPlaylist.controller('CommentsCtrl', ['$scope', 'SharedSongService', 'Socket', function($scope, SharedSongService, Socket){

	$scope.comment = '';

	SharedSongService.getComments($scope.a.commenting._id, function(song) {
		$scope.a.commenting.comments = song.comments;
	});

	Socket.on('comment' + $scope.a.commenting._id, function(data) { 
	//if(data.songId === $scope.a.commenting._id) {
		var comment = {
			comment: data.content.comment,
			user: {
				photoUrl: data.photoUrl,
				fullName: data.fullName
			}
		};
		$scope.a.commenting.comments.push(comment);
	//}
	});

	$scope.$on('$destroy', function () {
		Socket.removeListener('comment' + $scope.a.commenting._id);
	});

	$scope.makeComment = function(text) {
		$scope.comment = '';
		SharedSongService.addComment(text, $scope.playlist._id, $scope.a.commenting._id, function() {});
	};
}]);
