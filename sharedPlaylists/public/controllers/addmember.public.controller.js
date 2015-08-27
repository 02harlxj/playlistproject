SharedPlaylist.controller('AddMemberCtrl', ['$scope', 'SharedPlaylistService', function($scope, SharedPlaylistService){
	
	$scope.results = [];
	$scope.add = {
		selected: []
	};

	$scope.search = function(str) {
		SharedPlaylistService.userSearch(str, function(results) {
			$scope.results = results;
		});
	};
	
	$scope.selectMember = function(id, img) {
		var p = {_id: id, photoUrl: img};
		var t = $scope.add.selected.toString().indexOf(p);
		if(t>=0) {
			$scope.add.selected.slice(t, 0);
		} else {
			$scope.add.selected.push(p);
		}
	};

	$scope.addMembers = function() {
		var users = []
		for(var i=0; i<$scope.add.selected.length; i++) {
			users.push($scope.add.selected[i]._id);
		}
		SharedPlaylistService.addMember(users, $scope.playlist._id, function() {
			$scope.a.sidebarview = '';
		});
	};
}])
.directive('resultItem', function(){
	// Runs during compile
	return {
		restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
	    template: '<div class="person-img-wrap"><div class="img"><img ng-src="{{person.photoUrl}}"/></div><div class="circle"></div></div><div class="person-content-wrap"><h5>{{person.fullName}}</h5></div>',
		link: {
			pre: function($scope, iElm, iAttrs) {
				for(var i=0, a=$scope.playlist.users.length; i<a; i++) {
					if(iAttrs.id === $scope.playlist.users[i]._id) {
						iElm.addClass('selected member');
						break;
					}
				}
				for(var i=0, a=$scope.playlist.admins.length; i<a; i++) {
					if(iAttrs.id === $scope.playlist.admins[i]._id) {
						iElm.addClass('selected member');
						break;
					}
				}
			},
			post: function($scope, iElm, iAttrs) {
				console.log(iElm);
				iElm.on('click', function(event) {
					if(iElm.hasClass('member')) return;
					if(!iElm.hasClass('selected')) {
						iElm.addClass('selected');
						$scope.add.selected.push({_id: iAttrs.id, photoUrl: iAttrs.img});
					} else {
						iElm.removeClass('selected');

						for(var i=0; i < $scope.add.selected.length; i++) {
							console.log($scope.add.selected[i]._id);
							console.log(iAttrs.id);
							if($scope.add.selected[i]._id == iAttrs.id) {
								console.log('hello');
								$scope.add.selected.splice(i, 1);
								break;
							}
						}
					}
					$scope.$apply();
				});
			}
		},
	};
});
