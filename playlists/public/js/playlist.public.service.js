Playlist.service('SongService', ['$http', '$resource', function($http, $resource){
	var playlistId = '';
	var Song = $resource('/api/user/:userId/playlists/:playlistId/song/:songId', 
						{userId: userId, playlistId: '@playlistId', songId: '@id'});

	this.currentPlaylistId = function(id) {
		playlistId = id;
	};

    
    this.removePlaylist = function(playlistId, callback) {
        $http.delete('/api/user/' + userId + '/playlists/' + playlistId)
            .success(function(id) {
                callback(id);
            });
    };  

    this.setPrivacy = function(bool, callback) {
        $http.post('/api/user/' + userId + '/playlists/' + playlistId + '/privacy', {privacy: bool})
            .success(function(data) {
                callback(data);
            });
    };

	this.addSongToPlaylist = function(song, callback) {
		var newSong = new Song(song);
		newSong.$save({playlistId:playlistId},function(data) {
			callback(data);
		});
	};

    this.addSharedSongToPlaylist = function(song, playlist, callback) {
        var newSong = new Song(song);
        newSong.$save({playlistId:playlist},function(data) {
            callback(data);
        });
    };

    this.addExistingSongToPlaylist = function(song, playlistId) {
        $http.post('/api/user/' + userId + '/playlists/' + playlistId + '/song/dragged', song);
    };

	this.deleteSong = function(song, songs, callback) {
		var a = songs.indexOf(song);
    	songs.splice(a, 1);
    	angular.forEach(songs, function(value, key){
    		value.order = key + 1;
    	});
    	console.log(songs);

    	$http.post('/api/user/' + userId + '/playlists/' + playlistId + '/songs/update', songs)
    		.success(function(data) {
    			callback(data);
    		})
    		.error(function(data) {
    			callback(null);
    		});
	};

	this.reorderSongs = function(index, song, songs, callback) {

		var a = song.order - 1;
    	songs.splice(a, 1);
    	// place song back in new order
    	songs.splice(index, 0, song);
    	// re-order & save
    	angular.forEach(songs, function(value, key){
    		value.order = key + 1;
    	});
    	

    	$http.post('/api/user/' + userId + '/playlists/' + playlistId + '/songs/update', songs)
    		.success(function(data) {
    			callback();
    		})
    		.error(function(data) {
    			callback(null);
    		});
	};
}]);