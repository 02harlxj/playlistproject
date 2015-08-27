var PopupModule = angular.module('PopupModule', ['ui.bootstrap'])

.service('Popup', ['$modal', function($modal) {
    this.checkSongDetails = function(song, callback) {
        var modalInstance = $modal.open({
            animation: false,
            size: 'sm',
            templateUrl: 'partials/checkSongDetails.html',
            controller: 'CheckSongDetailsCtrl',
            resolve: {
                song: function () {
                    return song;
                }
            }
        });
        modalInstance.result.then(function(songDetails) {
            callback(songDetails);
        });
    };

    this.makeSure = function(operation, subject, callback) {
        var modalInstance = $modal.open({
            animation: false,
            size: 'sm',
            templateUrl: 'partials/makeSure.html',
            controller: 'MakeSureCtrl',
            resolve: {
                operation: function () {
                    return operation;
                },
                subject: function () {
                    return subject;
                }
            }
        });
        modalInstance.result.then(function(songDetails) {
            callback(songDetails);
        });
    };

    this.alert = function(info) {
        var modalInstance = $modal.open({
            animation: false,
            size: 'sm',
            templateUrl: 'partials/alert.html',
            controller: 'AlertCtrl',
            resolve: {
                info: function () {
                    return info;
                }
            }
        })
    };
}])

.controller('CheckSongDetailsCtrl', ['$scope', '$modalInstance', 'song', function($scope, $modalInstance, song) {
	if(song) {
		$scope.found = true;
		$scope.song = song;
		$scope.img = 'img/' + song.provider + '_logo.png';
	} else {
		$scope.found = false;
		$scope.img = 'img/notFound.png';

	}

	$scope.ok = function () {
    	$modalInstance.close($scope.song);
  	};
}])

.controller('MakeSureCtrl', ['$scope', '$modalInstance', 'operation', 'subject', function($scope, $modalInstance, operation, subject) {

	$scope.operation = operation;
	$scope.subject = subject;

	$scope.ok = function () {
    	$modalInstance.close(true);
  	};

  	$scope.cancel = function () {
    	$modalInstance.dismiss(false);
  	};
}])

.controller('AlertCtrl', ['$scope', '$modalInstance', 'info', function($scope, $modalInstance,info) {

    $scope.info = info;

    $scope.cancel = function () {
        $modalInstance.dismiss(false);
    };
}]);
