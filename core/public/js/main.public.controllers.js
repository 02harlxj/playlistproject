MainApp.controller('MainAppCtrl', ['$scope', '$resource', '$location', '$window', 'Socket', 'ShowTabs', 'SongService', 'LibraryService', 'SharedPlaylistService', 'SharedSongService', 'playing', 
	function($scope, $resource, $location, $window, Socket, ShowTabs, SongService, LibraryService, SharedPlaylistService, SharedSongService, playing){

	/*===========================================
		USER
	===========================================*/
	var User = $resource('/api/user/:userId', {userId:'@id'});

	// Get User
	$scope.user = User.get({userId:userId}, function() {
		console.log($scope.user);
		Socket.start(userId);
	});

	// Delete User
	$scope.deleteAccount = function() {
		User.remove({userId:userId});
	};

	Socket.on('new_song', function() { 			$scope.user.notifCount += 1; });
	Socket.on('comment', function() { 			$scope.user.notifCount += 1; });
	Socket.on('like', function() { 				$scope.user.notifCount += 1; });
	Socket.on('approval_member', function() { 	$scope.user.notifCount += 1; });
	Socket.on('invite', function() { 			$scope.user.notifCount += 1; });
	Socket.on('madeAdmin', function() { 		$scope.user.notifCount += 1; });

	/*===========================================
		DISPLAY CONFIG
    ===========================================*/
    // Show Menu
    $scope.menuHidden = true;
    $scope.showMenu = function() {
    	$scope.menuHidden = !$scope.menuHidden;
    };
    $scope.$on('$locationChangeSuccess', function () {
        $scope.menuHidden = true;
    });

	// Show Create Playlist View
	$scope.tab = {
		creatingPlaylist: false,
		creatingSharedPlaylist: false,
		addingSong: false,
		notifTabOpen: false,
		profileTabOpen: false,
		renaming: false
	};

	$scope.showAddPlaylist = function() {
		outsideClick('creatingPlaylist', 'currentInput', $scope.showAddPlaylist);
	};

	$scope.showAddSharedPlaylist = function() {
		outsideClick('creatingSharedPlaylist', 'sharedInput', $scope.showAddSharedPlaylist);
	};

	$scope.a = {
		currentlyEditing: '',
		currentSong: '',
		currentPlaylist: '',
		sidebarview: null,
		showPlaylist: false
	};
	$scope.showSidebar = function(song, type) {
		$scope.a.currentlyEditing = song;
		$scope.a.sidebarview = 'editing';
	};
	$scope.hideSidebar = function() {
		$scope.a.sidebarview = null;
	};


	// Toggle Profile Tab
    $scope.$window = $window;
	
	//$scope.profileTabOpen = false;
	$scope.profileTabToggle = function() {
		outsideClick('profileTabOpen', 'showTab', $scope.profileTabToggle);
	};

	// Toggle Notification Tab
	//$scope.notifTabOpen = false;
	$scope.notifTabToggle = function() {
		outsideClick('notifTabOpen', 'showNTab', $scope.notifTabToggle);
		$scope.user.notifCount = 0;
	};




	/*===========================================
		PLAYLISTS
	===========================================*/

	$scope.Playlist = $resource('/api/user/:userId/playlists/:playlistId', {userId:userId, playlistId: '@id'});

	$scope.createPlaylist = function(playlistName) {
		$scope.tab.creatingPlaylist = false;
		var newPlaylist = new $scope.Playlist({name: playlistName});
		newPlaylist.$save(function(data) {
			$scope.creatingPlaylist = false;
			$scope.user.playlists.push({_id: data._id, name: data.name});
		});
	};

	$scope.createSharedPlaylist = function(playlistName) {
		$scope.tab.creatingSharedPlaylist = false;
		SharedPlaylistService.add(playlistName, function(s) {
			$scope.creatingSharedPlaylist = false;
			$scope.user.sharedPlaylists.push({_id: s._id, name: s.name});
		});
	};

	$scope.dragToLibrary = function(song) {
		if(song.playlistId) {
			var songDetails = {
				artist: song.artist,
				provider: song.provider,
				title: song.title,
				videoId: song.videoId
			}
			LibraryService.addSongToLibrary(songDetails, userId, function(song) {
				$scope.user.library.push(song);
			});
		}
	};

	$scope.dragToPlaylist = function(song, playlist) {
		if(song.playlistId) {
			var songDetails = {
				artist: song.artist,
				provider: song.provider,
				title: song.title,
				videoId: song.videoId
			}
			SongService.addSharedSongToPlaylist(songDetails, playlist._id, function(data) {
				console.log(data);
				$scope.user.library.push(data);
			});
		} else {
			SongService.addExistingSongToPlaylist(song, playlist._id);
		}

		if(playlist._id === playing.playlist._id) {
			playing.playlist.songs.push(song);
		}

	};

	$scope.dragToSharedPlaylist = function(song, playlistId) {
		var songDetails = {
			artist: song.artist,
			provider: song.provider,
			title: song.title,
			videoId: song.videoId
		}
		SharedSongService.dragSongToPlaylist(playlistId, songDetails, function(data){
			if(playlistId === playing.playlist._id) {
				playing.playlist.songs.push(song);
			}
		});
	};

	$scope.currentOrder = '-added';
	$scope.currentStr = '';

	$scope.infScroll = {scrollHeight: 2200, num: 100 };

	var reOrder = function(order) {
		if($scope.currentOrder === order) {
			if($scope.currentOrder.indexOf('-') != -1) {
				$scope.currentOrder.substr(1);
			} else {
				$scope.currentOrder = '-' + $scope.currentOrder;
			}
		} else {
			$scope.currentOrder = order
		}
	};

	$scope.changeOrder = function(order) {
		$scope.infScroll = {scrollHeight: 2200, num: 100 };
		reOrder(order);
		console.log($scope.currentOrder);
		LibraryService.changeOrder($scope.currentOrder, $scope.currentStr, function(data) {
			$scope.user.library = data;
			playing.changeLibrarySort(data);
		});
	};

	$scope.searchLibrary = function(str) {
		$scope.infScroll = {scrollHeight: 2200, num: 100 };
		$scope.currentStr = str;
		LibraryService.searchLibrary($scope.currentOrder, str, function(data) {
			$scope.user.library = data;
			playing.changeLibrarySort(data);
		});
	};

	$scope.nextInLibrary = function(num) {
		LibraryService.nextInLibrary($scope.currentOrder, $scope.currentStr, num, function(data) {
			$scope.user.library = $scope.user.library.concat(data);
			playing.changeLibrarySort($scope.user.library);
		});
	};

	/*===========================================
		Show Player
	===========================================*/

	$scope.showPlayer = function() {
		$scope.a.showPlayer = !$scope.a.showPlayer;
	};

	/*===========================================
		Functions
	===========================================*/

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

}]);

// Library Controller
MainApp.controller('LibraryCtrl', ['$scope', 'ShowTabs', 'LibraryService', '$modal', 'Popup',
	function($scope, ShowTabs, LibraryService, $modal, Popup) {

	/*===========================================
		DISPLAY CONFIG
    ===========================================*/
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

	/*===========================================
		LIBRARY
    ===========================================*/

    $scope.getSongDetails = function(songUrl) {
    	LibraryService.getSongDetails(songUrl, function(song) {
    		$scope.openCheckDetails(song);
    	});
    };

    $scope.openCheckDetails = function(song) {
    	Popup.checkSongDetails(song, function(songDetails) {
    		LibraryService.addSongToLibrary(songDetails, userId, function(song) {
	    		$scope.user.library.push(song);
	    	});
    	});
    };


    $scope.removeSong = function(song) {
    	Popup.makeSure('Removing a song from your Library will remove it from all of your personal playlists as well. Are you sure you want to delete', song.title, function(bool) {
    		if(bool){
    			LibraryService.removeSongFromLibrary(song._id, userId, function(id) {
    				var a = $scope.user.library.indexOf(song);
    				$scope.user.library.splice(a, 1);
    			});
    		}
    	});
    };

}])
.controller('EditSongControl', ['$scope', 'LibraryService', function($scope, LibraryService) {

	$scope.song = {
		title: $scope.a.currentlyEditing.title,
		artist: $scope.a.currentlyEditing.artist,
		_id: $scope.a.currentlyEditing._id
	};

	$scope.editSong = function(songDetails) {
    	LibraryService.editSongDetails(songDetails, userId, function(id) {
    		var song = $scope.a.currentlyEditing;
    		for(var i=0; i<$scope.user.library.length; i++) {
    			if($scope.user.library[i]._id === $scope.a.currentlyEditing._id) {
    				$scope.user.library[i].title = songDetails.title;
    				$scope.user.library[i].artist = songDetails.artist;
    			} 
    		}

    		$scope.a.currentlyEditing.title = songDetails.title;
    		$scope.a.currentlyEditing.artist = songDetails.artist;

    		$scope.a.currentlyEditing = '';
    		$scope.a.sidebarview = null;

    	});
    };

}]);





