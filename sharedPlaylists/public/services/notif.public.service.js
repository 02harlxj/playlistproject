SharedPlaylist.service('NotificationService', ['$http', '$filter', function($http, $filter){
	this.get = function(callback) {
		$http.get('api/user/' + userId + '/notifications')
			.success(function(notifs) {
				createNotifContent(notifs, function(notifs) {
					callback(notifs);
				});
			});
	};

	this.markAsViewed = function(notif) {
		if(notif.viewed === false){
			$http.post('api/user/' + userId + '/notifications/' + notif._id);
		}
	};

	var createNotifContent = function(notifs, callback) {
		var TWELVE_HOURS = 12 * 60 * 60 * 1000;
		var ONE_HOUR = 60 * 60 * 1000;
		console.log(notifs);

		for(var i=0; i<notifs.length; i++) {
			switch(notifs[i].type) {
				case 'new_song':
					if(notifs[i].participantNum > 1) {
						var num = notifs[i].participantNum;
						notifs[i].str = num + ' new songs have been added to ';
					} else {
						notifs[i].str = '1 new song has been added to ';
					}
					break;
				case 'like':
					notifs[i].str = ' liked ';
					if(notifs[i].participantNum > 1) {
						var num = notifs[i].participantNum - 1;
						notifs[i].str = ' and ' + num + ' others' + notifs[i].str;
					}
					break;
				case 'comment':
					notifs[i].str = ' commented on ';
					if(notifs[i].participantNum > 1) {
						var num = notifs[i].participantNum - 1;
						notifs[i].str = ' and ' + num + ' others' + notifs[i].str;
					}
					break;
				case 'invite':
					notifs[i].str = ' invited you to join ';
					break;
				case 'approval_member':
					notifs[i].str = ' need your approval to join ';
					break;
				case 'madeAdmin':
					notifs[i].str = ' has made you an admin of ';
					break;
			}

			var d = new Date(notifs[i].added);
			var x = (new Date) - d;
			if (x < ONE_HOUR) {
				notifs[i].time = Math.round(x / 60 / 1000)+' mins';
			}else if (x < TWELVE_HOURS) {
				notifs[i].time = Math.round(x / 60 / 60 /1000)+' hrs';
			} else {
				notifs[i].time = $filter('date')(d, "d MMM 'at' h:mm a");
			}
		}
		callback(notifs);
	};
}]);