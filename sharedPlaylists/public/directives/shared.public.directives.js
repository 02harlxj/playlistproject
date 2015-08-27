SharedPlaylist.directive('likeBtn', ['SharedSongService', function(SharedSongService){
	return {
		restrict: 'A',
		link: {
			pre: function($scope, iElm, iAttrs) {
				for(var i=0, a=$scope.song.likedBy.length; i<a; i++) {
					if($scope.song.likedBy[i] === $scope.user._id) {
						iElm.removeClass('unliked');
						iElm.addClass('liked');
					}
				}
			},
			post: function($scope, iElm, iAttrs) {
				iElm.bind('click', function() {
					if(iElm.hasClass('unliked')) {
						$scope.a.currentlyEditing = $scope.song;
						SharedSongService.like($scope.playlist._id, $scope.song._id, function() {
							$scope.a.currentlyEditing.likedBy.push(userId); 
							iElm.removeClass('unliked');
						    iElm.addClass('liked');
						});
					}
				});
			}
		}
	};
}]);
