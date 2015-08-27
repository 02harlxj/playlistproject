MainApp.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });
 
                event.preventDefault();
            }
        });
    };
});

MainApp.directive('changeOrder', function() {
    return function(scope, el, attrs) {
        el.bind('click', function() {
            scope.$apply(scope.order = attrs.changeOrder);
            scope.$apply(scope.reverse = !scope.reverse);
            angular.forEach(el[0].parentElement.children, function(val) {
                angular.element(val).removeClass('sortUp');
                angular.element(val).removeClass('sortDown');
            });
            el.addClass((scope.reverse) ? "sortUp" : "sortDown");
        });
        if(scope.order == attrs.changeOrder) {
            el.addClass((scope.reverse) ? "sortUp" : "sortDown");
        }
    }
});

MainApp.directive('infiniteScroll', function() {
    return {
        link: function(scope, element, attrs) {

            scope.infScroll.scrollHeight = 2200;
            scope.infScroll.num = 100;

            element.on('scroll', function(e) {

                if(e.srcElement.scrollTop > scope.infScroll.scrollHeight) {
                    scope.infScroll.scrollHeight += 3070;
                    scope.nextInLibrary(scope.infScroll.num);
                    scope.infScroll.num += 100;
                }

            });

        }
    };
});

MainApp.directive('viewLoad', function() {
    return {
        link: function(scope, element, attrs) {

            scope.$on('$viewContentLoaded',
            function(){
                element.find('section').addClass('hidden');
                element.append('<div class="spinner uiview"><div class="rect1"></div><div class="rect2"></div><div class="rect3"></div><div class="rect4"></div><div class="rect5"></div></div>');
            });

            scope.$on('ContentLoaded',
            function() {
                angular.element(element[0].children[1]).removeClass('uiview');
                element.find('section').removeClass('hidden');
            });

        }
    };
});