SharedPlaylist.service('SharedPlaylistService', ['$http', '$state', function($http, $state) {

    this.add = function(name, callback) {
        $http.post('api/user/' + userId + '/shared', {name: name})
            .success(function(playlist) {
                callback(playlist);
            });
    };

    this.get = function(userId, id, callback) {
        $http.get('api/user/' + userId + '/shared/' + id)
            .success(function(data) {
                if(data === 'permissions_failure') {
                    $state.go('sharedplaylistguest', {playlistId: id});
                } else {
                    var playlist = data.playlist;
                    playlist.songs = data.songs;

                    var is_admin = false;
                    for(var i=0; i < playlist.admins.length; i++) {
                        console.log(playlist.admins[i]);
                        if(userId == playlist.admins[i]._id) {
                            is_admin = true;
                        }
                    }

                    callback(playlist, is_admin);
                }
            });
    };

    this.getForAccept = function(userId, id, callback) {
        $http.get('api/user/' + userId + '/shared/' + id + '/invited')
            .success(function(data) {
                callback(data);
            });
    };


    // Add Member

    this.addMember = function(users, playlistId, callback) {
        $http.post('api/user/' + userId + '/shared/' + playlistId + '/member', users)
            .success(function() {
                callback();
            });
    };

    this.requestJoin = function(userId, playlistId, callback) {
        $http.post('api/user/' + userId + '/shared/' + playlistId + '/requestjoin', [userId])
            .success(function() {
                callback();
            });
    };

    // join
    this.join = function(playlistId, callback) {
        $http.post('/api/user/' + userId + '/shared/' + playlistId + '/member/accept')
            .success(function(playlist) {
                callback(playlist);
            });
    };
    // decline
    this.decline = function(playlistId, callback) {
        $http.post('/api/user/' + userId + '/shared/' + playlistId + '/member/decline')
            .success(function() {
                callback();
            });
    };

    this.userSearch = function(str, callback) {
        $http.get('api/user/' + userId + '/users/search?str=' + str)
            .success(function(users) {
                callback(users);
            });
    };

    // Update settings

    this.updateSettings = function(settings, name, playlistId, callback) {
        $http.post('api/user/' + userId + '/shared/' + playlistId, {settings: settings, name: name})
            .success(function(playlist) {
                callback(playlist);
            });
    };

    // Reset notifCount

    this.resetNotifCount = function(callback) {
        $http.post('api/user/' + userId + '/resetNotifCount')
            .success(function() {
                callback();
            });
    };

    this.itemsApproval = function(playlistId, callback) {
        $http.get('api/user/' + userId + '/shared/' + playlistId + '/itemsApproval/')
            .success(function(users) {
                callback(users);
            });
    };

    this.approve = function(playlistId, memberId, callback) {
        var member = [memberId];
        $http.post('api/user/' + userId + '/shared/' + playlistId + '/member/' + memberId + '/approve/', member)
            .success(function() {
                callback();
            });
    };

    this.reject = function(playlistId, memberId, callback) {
        var member = [memberId];
        $http.post('api/user/' + userId + '/shared/' + playlistId + '/member/' + memberId + '/reject/', member)
            .success(function() {
                callback();
            });
    };

    this.makeadmin = function(playlistId, memberId, callback) {
        $http.post('/api/user/' + userId + '/shared/' + playlistId + '/member/' + memberId + '/makeAdmin')
            .success(function(playlist) {
                callback(playlist);
            });
    };

    this.removeuser = function(playlistId, memberId, callback) {
        $http.delete('/api/user/' + userId + '/shared/' + playlistId + '/member/' + memberId + '/remove')
            .success(function(playlist) {
                callback(playlist);
            });
    };

}]);
