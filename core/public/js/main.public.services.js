MainApp.constant('APIKeys', {
    'youtube': 'AIzaSyD4YQJtz8NUpOus3zvSN3WqweRVzpuga7w',
    'soundcloud': 'ac6158185eebd46f561edb8868dfb1a0',
    'vimeo': '16b72d29c6e14516633751996bac59b5'
});
MainApp.service('LibraryService', ['$http', 'APIKeys', 'SoundCloud', 'Youtube', 'Vimeo', function($http, APIKeys, SoundCloud, Youtube, Vimeo) {
    this.getSongDetails = function(songUrl, callback) {
        var domain = url_domain(songUrl);
        //Youtube
        if(domain === 'www.youtube.com' || domain === 'youtube.com'){
            Youtube.getInfoFromUrl(songUrl, function(song) {
                if(!null) callback(song);
            });
        //Soundcloud
        } else if (domain === 'www.soundcloud.com' || domain === 'soundcloud.com'){
            SoundCloud.getInfoFromUrl(songUrl, function(song) {
                if(song) callback(song);
            });
        //Vimeo
        } else if (domain === 'www.vimeo.com' || domain === 'vimeo.com'){
            Vimeo.getInfoFromUrl(songUrl, function(song) {
                if(song) callback(song);

            });
        // Not Supported
        } else {
            callback(null);
        }
    };

    this.addSongToLibrary = function(song, userId, callback) {
        $http.post('/api/user/' + userId + '/library', {songDetails:song})
            .success(function(data) {
                callback(data);
            }).
            error(function(data) {
                callback(null);
            });
    };

    function url_domain(url) {
        var a = document.createElement('a');
        a.href = url;
        return a.hostname;
    };

    this.removeSongFromLibrary = function(songId, userId, callback) {
        $http.delete('/api/user/' + userId + '/library/' + songId)
            .success(function(data) {
                callback(data);
            })
            .error(function(data) {
                callback(null);
            });
    };

    this.editSongDetails = function(song, userId, callback) {
        $http.post('/api/user/' + userId + '/library/' + song._id + '/edit', {title: song.title, artist: song.artist})
            .success(function(data) {
                callback(data);
            })
            .error(function(data) {
                callback(null);
            });
    };


    this.changeOrder = function(order, str, callback) {
        $http.get('api/user/' + userId + '/library/order?sort=' + order + '&str=' + str)
            .success(function(data) {
                callback(data);
            });
    };
    this.searchLibrary = function(order, str, callback) {
        $http.get('api/user/' + userId + '/library/search?sort=' + order + '&str=' + str)
            .success(function(data) {
                callback(data);
            });
    };
    this.nextInLibrary = function(order, str, num, callback) {
        $http.get('api/user/' + userId + '/library/scroll?sort=' + order + '&str=' + str + '&num=' + num)
            .success(function(data) {
                callback(data);
            });
    };

}]);

MainApp.service('ShowTabs', function(){
	this.closeOnOtherClick = function(event, cssClass, callbackOnClose) {
		var clickedElement = event.target;
        if (!clickedElement) return;

        var elementClasses = clickedElement.classList;
        var clickedOnTab = elementClasses.contains(cssClass) || (clickedElement.parentElement !== null && clickedElement.parentElement.classList.contains(cssClass));
        
        if (!clickedOnTab) {
            callbackOnClose();
            return;
        }
	}
});

MainApp.service('GetId', function() {
    this.firstPath = function(path, second) {
        var n = path.lastIndexOf('/' + second + '/');
        var res = path.substr(0, n - 1);
        return(res);
    };
    this.fromPath = function(path) {
        var n = path.lastIndexOf("/");
        var res = path.substr( n + 1, path.length - n );
        return res;
    };
});

MainApp.service('SoundCloud', ['APIKeys', function(APIKeys) {
    console.log('SC');
    SC.initialize({
        client_id: APIKeys.soundcloud
    });

    this.getInfoFromUrl = function(url, callback) {
        SC.get('/resolve', { url: url }, function(track) {
            var song = {
                provider: 'soundcloud',
                title: track.title,
                artist: track.user.username,
                videoId: track.id
            };
            callback(song);
        });
    };
}]);

MainApp.service('Youtube', ['$http', 'APIKeys', function($http, APIKeys) {
    

    this.getInfoFromUrl = function(songUrl, callback) {
        var song = {
            provider: 'youtube',
            title: '',
            artist: '',
            videoId: ''
        }

        var regExp = /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
        var match = songUrl.match(regExp);
        if (match&&match[1].length==11){
            song.videoId = match[1];
        }else{
            return 'err';
        }


        var urlCall = "https://www.googleapis.com/youtube/v3/videos?id=" + song.videoId + "&part=snippet&key=" + APIKeys.youtube;
        $http.get(urlCall)
            .success(function(data) {

                var temp = data.items[0].snippet.title;
                // if is in format 'artist - title', separate
                if(temp.indexOf(' - ') > 0) {
                    var tempArray = temp.split(' - ');
                    song.artist = tempArray[0];
                    song.title = tempArray[1];
                } else {
                    song.title = temp;
                }
                // else, use as title
                callback(song);
            })
            .error(function(data) {
                callback(null);
            });
    }
}]);

MainApp.service('Vimeo', ['$http', 'APIKeys', function($http, APIKeys) {

    this.getInfoFromUrl = function(songUrl, callback) {
        var song = {
            provider: 'vimeo',
            title: '',
            artist: '',
            videoId: ''
        }
        var regExp = /https?:\/\/(?:www\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/;
        var match = songUrl.match(regExp);
            song.videoId = match[3];

        var urlCall = "https://api.vimeo.com/videos/" + song.videoId + "?access_token=" + APIKeys.vimeo;
        $http.get(urlCall)
            .success(function(data) {
                song.title = data.name;
                song.artist = data.user.name;
                song.videoId = data.uri.slice(8);;
                callback(song);
            })
            .error(function(data) {
                callback(null);
            });
    }

}]);

MainApp.service('ContentLoaded', ['$rootScope', function($rootScope) {
    this.loaded = function() {
        $rootScope.$broadcast('ContentLoaded');
    }
}]);







