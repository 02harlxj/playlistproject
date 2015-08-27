SpinnerModule = angular.module('SpinnerModule', [])

.directive('loadingIcon', ['$rootScope', function($rootScope) {
	return {
		restrict: 'E',
		template: '<div class="spinner"><div class="rect1"></div><div class="rect2"></div><div class="rect3"></div><div class="rect4"></div><div class="rect5"></div></div>',
		replace: true,
		link: function(scope, el, attrs) {
			$rootScope.$watch('loading', function(newVal) {
				if(newVal == true) {
					el.addClass('loading');
				} else {
					el.removeClass('loading');
				}
			});
		}
	};
}])

.directive('loadingContent', ['$rootScope', function($rootScope) {
	return {
		restrict: 'A',
		link: function(scope, el, attrs) {
			$rootScope.$watch('loading', function(newVal) {
				if(newVal == true) {
					el.addClass('hidden');
				} else {
					el.removeClass('hidden');
				}
			});
		}
	};
}])

.factory('httpInterceptor', ['$q', '$rootScope', function ($q, $rootScope) {
  	$rootScope.loading = false;
  	return {
  		'request': function(config) {
  			$rootScope.loading = true;
            return config || $q.when(config);
  		},
  		'requestError': function(rejection) {
  			$rootScope.loading = false;
  			return $q.reject(rejection);
  		},
  		'response': function(res) {
  			$rootScope.loading = false;
  			return res || $q.when(res);
  		},
  		'responseError': function(rejection) {
  			$rootScope.loading = false;
  			return $q.reject(rejection);
  		}
  	}
}])

.config(['$httpProvider', function($httpProvider) {
  $httpProvider.interceptors.push('httpInterceptor');
}]);
