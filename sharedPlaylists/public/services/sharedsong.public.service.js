SharedPlaylist.service('SharedSongService', ['$http', function($http){

	this.addSongToPlaylist = function(sharedId, song, callback) {
        console.log(song);
		$http.post('/api/user/' + userId + '/shared/' + sharedId + '/sharedSong/song', song)
            .success(function(data) {
                callback(data);
            });
	};

    this.dragSongToPlaylist = function(sharedId, song, callback) {
        console.log(song);
        $http.post('/api/user/' + userId + '/shared/' + sharedId + '/sharedSong/dragto', song)
            .success(function(data) {
                callback(data);
            });
    };

    this.get = function(sharedId, songId, callback) {
        $http.get('/api/user/' + userId + '/shared/' + sharedId + '/sharedSong/song/' + songId)
            .success(function(data) {
                callback(data);
            });
    };

    this.edit = function(songId, sharedId, songDetails, callback) {
        $http.post('/api/user/' + userId + '/shared/' + sharedId + '/sharedSong/song/' + songId, songDetails)
            .success(function(data) {
                callback(data);
            });
    };

    this.delete = function(songId, sharedId, callback) {
        $http.delete('/api/user/' + userId + '/shared/' + sharedId + '/sharedSong/song/' + songId)
            .success(function() {
                callback();
            });
    };

    this.searchPlaylist = function(playlistId, order, str, callback) {
        $http.get('api/user/' + userId + '/shared/' + playlistId + '/search?sort=' + order + '&str=' + str)
            .success(function(data) {
                console.log(data);
                callback(data);
            });
    };

    this.changeOrder = function(playlistId, order, str, callback) {
        $http.get('api/user/' + userId + '/shared/' + playlistId + '/order?sort=' + order + '&str=' + str)
            .success(function(data) {
                callback(data);
            });
    };

    // Comments

    this.getComments = function(songId, callback) {
        $http.get('api/user/' + userId + '/sharedSong/' + songId + '/comments')
            .success(function(data) {
                callback(data);
            });
    };

    this.addComment = function(text, playlistId, songId, callback) {
        $http.post('api/user/' + userId + '/shared/' + playlistId + '/sharedSong/' + songId + '/comment', {comment: text})
            .success(function() {
                callback();
            });
    };

    // Like

    this.like = function(playlistId, songId, callback) {
        $http.post('api/user/' + userId + '/shared/' + playlistId + '/sharedSong/' + songId + '/like')
            .success(function() {
                callback();
            });
    };





}]);