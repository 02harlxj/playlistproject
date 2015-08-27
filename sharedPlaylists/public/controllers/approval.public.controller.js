SharedPlaylist.controller('ApproveMemberCtrl', ['$scope', 'SharedPlaylistService', 'Popup', function($scope, SharedPlaylistService, Popup){
	
	$scope.users = [];

	SharedPlaylistService.itemsApproval($scope.playlist._id, function(users) {
		$scope.users = users;
	});

	$scope.approve = function(user) {
		Popup.makeSure('approve adding a member to playlist:', user.fullName, function(bool) {
    		if(bool) {
    			SharedPlaylistService.approve($scope.playlist._id, user._id, function() {
    				for(var i=0; i<$scope.users.length; i++) {
    					if($scope.users[i]._id === user._id) {
    						$scope.users.splice(i, 1);
                            $scope.playlist.users_waiting_approval.splice(i, 1);
    					}
    				}
    			});
    		}
    	});
	};

	$scope.reject = function(user) {
		Popup.makeSure('reject adding a member to playlist:', user.fullName, function(bool) {
    		if(bool) {
    			SharedPlaylistService.reject($scope.playlist._id, user._id, function() {
    				for(var i=0; i<$scope.users.length; i++) {
    					if($scope.users[i]._id === user._id) {
    						$scope.users.splice(i, 1);
                            $scope.playlist.users_waiting_approval.splice(i, 1);
    					}
    				}
    			});
    		}
    	});
	};

}])
.directive('approvalItem', function(){
	// Runs during compile
	return {
		restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
		templateUrl: 'partials/approveItem.html',
		link: function($scope, iElm, iAttrs, controller) {
		}
	};
});
