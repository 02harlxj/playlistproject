SharedPlaylist.controller('SharedPlaylistCtrl', ['$scope', '$location', '$state', 'GetId', 'ShowTabs', 'SharedPlaylistService', 'LibraryService', 'SharedSongService', 'playing', 'Popup', 'ContentLoaded', 
	function($scope, $location, $state, GetId, ShowTabs, SharedPlaylistService, LibraryService, SharedSongService, playing, Popup, ContentLoaded){
	var sharedPlaylistId = GetId.fromPath($location.path());

/*=====================================================
	Get Playlist
=====================================================*/
	// User privilages 
	$scope.is_admin = false;
	$scope.playlist = {};
	$scope.perms = {};

	SharedPlaylistService.get($scope.user._id, sharedPlaylistId, function(playlist, is_admin, settings) {
		$scope.is_admin = is_admin;
		$scope.playlist = playlist;
		$scope.perms = playlist.settings.permissions;
		ContentLoaded.loaded();
	});

/*=====================================================
	Socket
=====================================================*/
/*=====================================================
	Song Operations
=====================================================*/

	$scope.getSongDetails = function(songUrl) {
		LibraryService.getSongDetails(songUrl, function(song) {
    		$scope.addSongCheck(song);
    	});
	};

	$scope.addSongCheck = function(song) {
		Popup.checkSongDetails(song, function(songDetails) {
	    	SharedSongService.addSongToPlaylist($scope.playlist._id, songDetails, function(song) {
	    		song.addedBy = {
	    			_id: $scope.user._id,
	    			photoUrl: $scope.user.photoUrl
	    		};
	    		if(playing.playlist._id === $scope.playlist._id) {
	    			playing.playlistAddTo($scope.playlist._id, song);
	    		} else {
	    			$scope.playlist.songs.push(song);
	    			$scope.user.library.push(song);
	    		}

	    	});
		});
	};

	$scope.editSharedSong = function(songDetails) {
		SharedSongService.edit($scope.a.currentlyEditing._id, $scope.playlist._id, songDetails, function(songDetails) {
	
    		for(var i=0; i < $scope.playlist.songs.length; i++) {
    			if($scope.playlist.songs[i]._id === $scope.a.currentlyEditing._id) {
    				$scope.playlist.songs[i].title = songDetails.title;
    				$scope.playlist.songs[i].artist = songDetails.artist;
    			} 
    		}

    		$scope.a.currentlyEditing.title = songDetails.title;
    		$scope.a.currentlyEditing.artist = songDetails.artist;

    		$scope.a.currentlyEditing = '';
    		$scope.a.sidebarview = null;
		});
	};

	$scope.deleteSong = function(song) {
		Popup.makeSure('remove song from playlist?', song.title, function(bool){
			if(bool) {
				SharedSongService.delete(song._id, $scope.playlist._id, function() {
					var a;
					for(var i=0; i < $scope.playlist.songs.length; i++) {
						if($scope.playlist.songs[i]._id === song._id) {
							a = i;
						}
					}
					$scope.playlist.songs.splice(a, 1);
				});
			}
		});
	}

/*=====================================================
	Playlist Display Config
=====================================================*/

	$scope.addingSong = false;
    $scope.showAddSong = function() {
    	outsideClick('addingSong', 'songInput', $scope.showAddSong);
    };

    var outsideClick = function(target, cssClass, callback) {
		for(var key in $scope.tab) {
			if(key != target) {
				$scope.tab[key] = false;
			} else {
				$scope.tab[target] = !$scope.tab[target];
			}
		}
		if ($scope.tab[target]) {
            $scope.$window.onclick = function(event) {
                ShowTabs.closeOnOtherClick(event, cssClass, callback);
            };
        } else {
        	$scope.tab[target] = false;	
            $scope.$window.onclick = null;
            $scope.$apply();
        }
	};

/*=====================================================
	Playlist Sort & Search
=====================================================*/	

	$scope.searchPlaylist = function(str) {
		$scope.infScroll = {scrollHeight: 2200, num: 100 };
		$scope.currentStr = str;
		SharedSongService.searchPlaylist($scope.playlist._id, $scope.currentOrder, str, function(data) {
			$scope.playlist.songs = data;
			playing.changeSharedSort($scope.playlist._id, data);
		});
	};

	$scope.changeOrder = function(order) {
		$scope.infScroll = {scrollHeight: 2200, num: 100 };
		reOrder(order);
		console.log($scope.currentOrder);
		SharedSongService.changeOrder($scope.playlist._id, $scope.currentOrder, $scope.currentStr, function(data) {
			$scope.playlist.songs = data;
			playing.changeSharedSort($scope.playlist._id, data);
		});
	};

	var reOrder = function(order) {
		if($scope.currentOrder === order) {
			if($scope.currentOrder.indexOf('-') != -1) {
				$scope.currentOrder.substr(1);
			} else {
				$scope.currentOrder = '-' + $scope.currentOrder;
			}
		} else {
			$scope.currentOrder = order;
		}
	};

/*=====================================================
	Like Song
=====================================================*/

$scope.like = function(song) {
	$scope.a.currentlyEditing = song;
	SharedSongService.like($scope.playlist._id, song._id, function() {
		$scope.a.currentlyEditing.likedBy.push(userId); 
	});
};

/*=====================================================
	Sidebar View
=====================================================*/
    $scope.a.sidebarview = null;

	// Add Member
	$scope.addMemberShow = function() {
		$scope.a.sidebarview = 'addmembers';
	};

	// Settings
	$scope.settingsShow = function() {
		$scope.a.sidebarview = 'settings';
	};

	// Comment
	$scope.commentsShow = function(song) {
		$scope.a.commenting = song;
		$scope.a.sidebarview = 'comments';
	};

	// Edit Song
	$scope.editSongShow = function(song) {
		$scope.a.currentlyEditing = song;
		$scope.a.sidebarview = 'editsong';
	};

	// Approval
	$scope.approvalShow = function() {
		$scope.a.sidebarview = 'approval';
	};

/*=====================================================
	Admin User Actions
=====================================================*/

	// Remove User
	$scope.removeuser = function(member) {
		Popup.makeSure('remove user from playlist?', member.fullName, function(bool) {
    		if(bool) {
    			SharedPlaylistService.removeuser($scope.playlist._id, member._id, function(playlist) {
    				$scope.playlist = playlist;
    			});
    		}
    	});
	};

	// Make User an Admin
	$scope.makeadmin = function(member) {
		Popup.makeSure('make user an admin?', member.fullName, function(bool) {
    		if(bool) {
    			SharedPlaylistService.makeadmin($scope.playlist._id, member._id, function(playlist) {
    				$scope.playlist.admins = playlist.admins;
    				$scope.playlist.users = playlist.users;
    			});
    		}
    	});
	};

/*=====================================================
	User Actions
=====================================================*/

	// Remove User
	$scope.leave = function(member) {
		if($scope.is_admin && $scope.playlist.admins.length === 1 && $scope.playlist.users.length > 0) {
			Popup.alert('You cannot leave this playlist because you are the only admin. Please make another member an admin and try again.');
		} else {
			Popup.makeSure('Are you sure you want to leave this playlist?', $scope.playlist.name, function(bool) {
    		if(bool) {
    			SharedPlaylistService.removeuser($scope.playlist._id, $scope.user._id, function(playlist) {
    				$state.go('library');
    				var a;
    				for(var i=0; i<$scope.user.sharedPlaylists.length; i++) {
    					if($scope.user.sharedPlaylists[i]._id === playlist._id){
    						var a = i;
    						break;
    					}
    				}
    				$scope.user.sharedPlaylists.splice(a, 1);
    			});
    		}
    	});
		}
	};

}])
.controller('JoinPlaylistCtrl', ['$scope', 'SharedPlaylistService', '$location', '$state', 'GetId', 'ContentLoaded', function($scope, SharedPlaylistService, $location, $state, GetId, ContentLoaded) {
	/*=====================================================
	Accept/Decline Membership
=====================================================*/
	var sharedPlaylistId = GetId.fromPath($location.path());

    SharedPlaylistService.getForAccept($scope.user._id, sharedPlaylistId, function(playlist) {
		$scope.playlist = playlist.playlist;
		ContentLoaded.loaded();
	});

	//Join
	$scope.join = function() {
		SharedPlaylistService.join($scope.playlist._id, function(playlist) {
			$scope.playlist = playlist;
			$scope.user.sharedPlaylists.push({
				_id: playlist._id,
				name: playlist.name
			});
			$state.go('sharedplaylist', {playlistId: playlist._id});
		});
	};

	//Decline
	$scope.decline = function() {
		SharedPlaylistService.decline($scope.playlist._id, function() {
			window.history.back();
		});
	};
}]);
