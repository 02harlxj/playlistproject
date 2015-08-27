PlayerModule = angular.module('PlayerModule', [])

.controller('PlayerCtrl', ['$scope', 'playing', 'player', function($scope, playing, player){

	$scope.playingnow = false;

	$scope.provider = 'none';
	$scope.videoId = '';
	$scope.song = '';

	$scope.$on('playSong', function(){
		$scope.provider = playing.song.provider;
		$scope.videoId = playing.song.videoId;
		$scope.song = playing.song;
		$scope.a.currentSong = $scope.song._id;
		$scope.playingnow = true;

		$scope.$apply();
	});

	$scope.$on('playpauseSong', function(obj, state) {
		$scope.playingnow = state;
		$scope.$apply();
	});


	$scope.next = function() {
		playing.index = Number(playing.index) + 1;
		cueSong();
	};

	$scope.prev = function() {
		playing.index -= 1;
		cueSong();
	};

	var cueSong = function() {
		if(playing.playlist.songs[playing.index] !== undefined) {
			playing.song = playing.playlist.songs[playing.index];
			$scope.provider = playing.song.provider;
			$scope.videoId = playing.song.videoId;
			$scope.song = playing.song;
			$scope.a.currentSong = $scope.song._id;
		} else {
			player.reset();
			$scope.provider = 'none';
			$scope.videoId = '';
			$scope.song = '';
			$scope.a.currentSong = '';
		}
	}

	$scope.start = function() {
		if($scope.provider === 'youtube') {
			player.instance.playVideo();
		} else if ($scope.provider === 'soundcloud') {
			player.instance.play();
		} else if ($scope.provider === 'vimeo') {
			player.instance.api('play');
		}
	};

	$scope.pause = function() {
		if($scope.provider === 'youtube') {
			player.instance.pauseVideo();
		} else if ($scope.provider === 'soundcloud') {
			player.instance.pause();
		} else if ($scope.provider === 'vimeo') {
			player.instance.api('pause');
		}
	};

	// Volume

	$scope.volume = {};
	$scope.volume.num = 60;
	
	$scope.$watch('volume.num', function(newValue) {
		player.changeVolume(newValue);
	});

}])

.factory('playing', ['$rootScope', '$filter', function($rootScope, $filter){
	playing = {};

	playing.playlist = [];
	playing.song = {};
	playing.index = '';
	playing.orderArray = [];

	playing.playlistAddTo = function(playlistId, song) {
		if(playlistId === this.playlist._id) {
			this.playlist.songs.push(song);
		}
		// else if playing from library, do this...
	};

	playing.playlistDeleteFrom = function(playlist, order, reverse) {
		if(playlist._id === this.playlist._id) {
			this.playlist = playlist;
			this.playlist.songs = $filter('orderBy')(playing.playlist.songs, order, reverse);
		}
		// else if playing from library, do this...
	};

	playing.changeLibrarySort = function(playlist) {
		if(playing.playlist.length != 0 && playing.playlist._id == 'library'){
			playing.playlist.songs = playlist;
			findIndexById(function(index) {
				playing.index = index;
			});
		}
		// update index
	};

	playing.changeSharedSort = function(playlistId, playlist) {
		if(playing.playlist.length != 0 && playing.playlist._id == playlistId){
			playing.playlist.songs = playlist;
			findIndexById(function(index) {
				playing.index = index;
			});
		}
		// update index
	};

	playing.changePlaylistSort = function(playlistId, order, reverse) {
		if(playing.playlist.length != 0 && playing.playlist._id == playlistId){
			playing.playlist.songs = $filter('orderBy')(playing.playlist.songs, order, reverse);
			findIndexById(function(index) {
				playing.index = index;
			});
		}
	};

	var findIndexById = function(callback) {
		for(var i=0; i<playing.playlist.songs.length; i++) {
			if(playing.playlist.songs[i]._id === playing.song._id) {
				callback(i);
				break;
			} 
		}
	};

	playing.playlistChangeOrder = function(playlist) {
		if(playlist._id === this.playlist._id) {
			this.playlist = playlist;
			var found = $filter('getById')(playlist.songs, playing.song._id);
			this.index = found.order - 1;
		}
	};

	playing.broadcastSongPrep = function(playing) {
		this.playlist = playing.playlist;
		this.song = playing.song;
		this.index = playing.index;
		console.log(this);
		this.broadcastSong();
	};

	playing.broadcastNextSong = function() {
		this.index = Number(this.index) + 1;
		this.song = this.playlist.songs[this.index];
		this.broadcastSong();
	};

	playing.pause = function() {
		this.broadcastPlayPause(false);
	};

	playing.start = function() {
		this.broadcastPlayPause(true);
	};

	playing.broadcastPlayPause = function(state) {
		$rootScope.$broadcast('playpauseSong', state);
	};

	playing.broadcastSong = function() {
		$rootScope.$broadcast('playSong');
	};

	return playing;
}])


.factory('player', ['$rootScope', 'playing', function($rootScope, playing){
	player = {};

	player.provider = 'none';
	player.instance = '';
	player.volume = {};

	player.youtube = function(videoId) {
		
		if(this.provider != 'youtube') {
			this.instance = new YT.Player('ytplayer', {
		  		height: '200',
		  		width: '200',
		  		videoId: videoId,
		  		events: {
		  			'onReady': function(event) {
		  				console.log(player);
		            	player.instance.setVolume( player.volume.youtube );
		            },
		            'onStateChange': function(event) {
						if (event.data == 1) {
							// Send to PlayerCtrl
							// Play
							playing.start();
						}
						if (event.data == 2) {
							// Send to PlayerCtrl
							// Pause
							playing.pause();
						}
					 	if (event.data == 0) {
					 		playing.broadcastNextSong();
					 		// Send new videoId & provider to PlayerCtrl
						}
		            }
		        },
		  		playerVars: {
		            autoplay: 1
		        }
			});
			this.provider = 'youtube';
		} else {
			this.instance.setVolume( this.volume.youtube );
    		this.instance.loadVideoById({videoId:videoId});
    		//this.instance.playVideo();
		}
	

	};

	player.soundcloud = function(videoId) {
		if(this.provider != 'soundcloud') {
			var widgetIframe = document.querySelector('#soundcloud_widget');
			this.instance = SC.Widget(widgetIframe);

			this.instance.bind(SC.Widget.Events.READY, function() {
				player.instance.setVolume(player.volume.soundcloud);
			});
			// react to end of song
			this.instance.bind(SC.Widget.Events.FINISH, function(player, data) {
				playing.broadcastNextSong();
			});

			// react to pause
			this.instance.bind(SC.Widget.Events.PAUSE, function() {
				playing.pause();
			});

			// react to play
			this.instance.bind(SC.Widget.Events.PLAY, function() {
				player.instance.setVolume(player.volume.soundcloud);
				playing.start();
			});
			this.provider = 'soundcloud';
		}
		this.instance.load('http://api.soundcloud.com/tracks/' + videoId, {auto_play: true});
	};

	player.vimeo = function() {
		var widgetIframe = document.querySelector('#vimeo_widget');
		this.instance = $f(widgetIframe);
		console.log(this.instance);
		this.instance.addEvent('ready', function() {
			player.instance.api('setVolume', player.volume.vimeo);
			player.instance.api('play');
			player.instance.addEvent('pause', function() {
				playing.pause();
			});
			player.instance.addEvent('play', function() {
				playing.start();
			});
		});
		this.provider = 'vimeo';
	};

	player.changeVolume = function(num) {

		this.volume.youtube = num;
		this.volume.vimeo = num/100;
		this.volume.soundcloud = num/100;

		if(this.provider === 'soundcloud') {
			this.instance.setVolume(this.volume.soundcloud);
		} else if(this.provider === 'youtube') {
			this.instance.setVolume(this.volume.youtube);
		} else if(this.provider === 'vimeo') {
			this.instance.api('setVolume', this.volume.vimeo);
		}

	};

	player.reset = function() {
		player.provider = 'none';
	    player.instance = '';
	    playing.song = {};
	    playing.index = '';
	    playing.playlist = [];
	}

	return player;
}])

.directive('playSong', ['playing', '$filter', function(playing, $filter) {
	return function(scope, el, attrs) {
		el.bind('dblclick', function() {
			var newSong = {
				playlist: {}
			};
			newSong.song = scope.song;

			if(attrs.playSong === 'library') {
				newSong.index = attrs.index;
				newSong.playlist.songs = scope.user.library;
				newSong.playlist._id = 'library';
			} 
			if(attrs.playSong === 'shared') {
				newSong.index = attrs.index;
				newSong.playlist.songs = scope.playlist.songs;
				newSong.playlist._id = scope.playlist._id;
			}
			if(attrs.playSong === 'playlist') {
				newSong.playlist._id = scope.playlist._id;
				newSong.playlist.songs = $filter('orderBy')(scope.playlist.songs, scope.order, scope.reverse);
				newSong.index = attrs.index;
			}

			playing.broadcastSongPrep(newSong);

		});
	};
}])

.directive('youtubeVid', ['$sce', 'player', function($sce, player) {
	return {
		restrict: 'E',
		scope: { videoId:'=' },
		replace: true,
		template: '<div id="ytplayer"></div>',
		link: function (scope) {
		    scope.$watch('videoId', function (newVal) {
		       if (newVal) {
		           player.youtube(newVal);
		       }
		    });
		}
	};
}])

.directive('soundcloudVid', ['$sce', 'player', '$window', function($sce, player, $window) {
	return {
		restrict: 'E',
		scope: { videoId: '=' },
		replace: true,
		template: '<iframe id="soundcloud_widget" src="https://w.soundcloud.com/player/?url=#" width="200" height="120" frameborder="no"></iframe>',
		link: function(scope) {
			scope.$watch('videoId', function(newVal) {
				if(newVal) {
					player.soundcloud(newVal);
				}
			});
		}
	}
}])

.directive('vimeoVid', ['$sce', 'player', '$window', function($sce, player, $window) {
	return {
		restrict: 'E',
		scope: { videoId: '=' },
		replace: true,
		template: '<iframe id="vimeo_widget" src="{{url}}" width="200" height="120" frameborder="no" onLoad="vimeo_loaded()"></iframe>',
		link: function(scope) {
			$window.vimeo_loaded = function() {
				player.vimeo();
			}
			scope.$watch('videoId', function(newVal) {
				if(newVal) {
					scope.url = $sce.trustAsResourceUrl("https://player.vimeo.com/video/" + scope.videoId + "?api=1&player_id=vimeo_widget");
				}
			});
		}
	}
}])

.filter('getById', function() {
  return function(input, id) {
    var i=0, len=input.length;
    for (; i<len; i++) {
    	console.log(id);
    	console.log(input[i]._id);

      if (input[i]._id == id) {
        return input[i];
      }
    }
    return null;
  }
});