SocketModule = angular.module('SocketModule', [])

SocketModule.service('Socket', ['$timeout', function($timeout) {

	this.socket = io();

	this.on = function(eventName, callback) {
		this.socket.on(eventName, function(data) {
			$timeout(function() {
				callback(data);
			});
		});
	};

	this.start = function(userId, playlists) {
		this.socket.emit('start', {userId: userId});
	};

	this.removeListener = function(eventName) {
		this.socket.removeListener(eventName);
	};

}]);