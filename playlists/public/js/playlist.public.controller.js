Playlist.controller('PlaylistCtrl', ['$scope', '$location', '$state', '$modal', 'GetId', 'ShowTabs', 'SongService', 'LibraryService', 'Popup', 'playing', 'ContentLoaded',
	function($scope, $location, $state, $modal, GetId, ShowTabs, SongService, LibraryService, Popup, playing, ContentLoaded){

	/*===========================================
		DISPLAY CONFIG
    ===========================================*/

    $scope.order = 'order';

    $scope.showRename = function() {
    	outsideClick('renaming', 'showInput', $scope.showRename);
    }
    $scope.tab.addingSong = false;
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

	// Sidebar
	$scope.currentlyEditing = '';
	$scope.sidebarview = null;

	/*===========================================
		PLAYLIST OPERATIONS
	===========================================*/
	// Get Playlist
	var playlistId = GetId.fromPath($location.path());
	// Set Current PlaylistId
	SongService.currentPlaylistId(playlistId);
	$scope.playlist = $scope.Playlist.get({playlistId:playlistId}, function() {
		if($scope.playlist.err === 'permissions failure') {
			$state.go('userplaylist', {userId: $scope.playlist.userId, playlistId: playlistId});
		}
		ContentLoaded.loaded();
	});

	// Delete Playlist
	$scope.removePlaylist = function(name) {
		Popup.makeSure('delete', name, function(bool) {
    		if(bool) {
    			SongService.removePlaylist(playlistId, function(id) {
    				var a;
    				for(var i=0; i<$scope.user.playlists.length; i++) {
    					if($scope.user.playlists[i]._id === id) {
    						a = i;
    					}
    				}
		    		$scope.user.playlists.splice(a, 1);
		    		$state.go('library');
    			});
    		};
    	});
		
	};


	$scope.renamePlaylist = function(name) {
		// Save name to server
		$scope.playlist.name = name;
		$scope.playlist.$save({playlistId:$scope.playlist._id});

		// Make local changes
		for (var i = 0, len = $scope.user.playlists.length; i < len; i++) {
    		if( $scope.playlist._id === $scope.user.playlists[i]._id ) {
    			$scope.user.playlists[i].name = name;
    		}
		}
	};

	$scope.$watchGroup(['order', 'reverse'], function(newValues) {
		playing.changePlaylistSort($scope.playlist._id, newValues[0], newValues[1]);
	});

	$scope.privacy = function(private) {
		if(private) {
			str = 'Selecting this option will hide this playlist from everyone but yourself'
		} else {
			str = 'Selecting this option will allow others to view this playlist'
		}
		Popup.makeSure(str, 'continue?', function(bool){
			if(bool) {
				SongService.setPrivacy(private, function(data){
					$scope.playlist.private = data;
				});
			}
		});
	};

	/*===========================================
		SONG OPERATIONS
	===========================================*/

	$scope.getSongDetails = function(songUrl) {
		LibraryService.getSongDetails(songUrl, function(song) {
    		console.log(song);
    		$scope.openCheckDetails(song);
    	});
	};

	$scope.openCheckDetails = function(song) {

		Popup.checkSongDetails(song, function(songDetails) {
			songDetails.order = $scope.playlist.songs.length + 1;
	    	//Save the song
	    	SongService.addSongToPlaylist(songDetails, function(song) {
	    		$scope.playlist.songs.push(song);
	    		$scope.user.library.push(song);
	    		playing.playlistAddTo($scope.playlist._id, song);
	    	});
		});
    };

    $scope.deleteSong = function(song) {
    	Popup.makeSure('delete', song.title, function(bool) {
    		if(bool) {
    			SongService.deleteSong(song, $scope.playlist.songs, function(playlist) {
    				$scope.playlist.songs = playlist.songs;
    				playing.playlistDeleteFrom(playlist);
    			});
    		};
    	});
    };

    $scope.onDropComplete = function(index, song) {
    	// remove song
    	if ($scope.order === 'order') {
    		SongService.reorderSongs(index, song, $scope.playlist.songs, function() {
	    		playing.playlistChangeOrder($scope.playlist);
	    	});
    	}
    };

}]);












