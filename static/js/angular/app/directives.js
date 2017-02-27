'use strict';

gigzagApp.directive('gigItem', function() {
    return {
        link: function(scope, element, attrs) {
            scope.$watch('gigs.length', function(ov, nv) {
                if(scope.gigs.length > 1) {
                    activateSlider();
                } else {
                    destroySlider();
                }
                bindEvents();
            });

        }
    };
});

gigzagApp.directive('searchInput', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.performSearch();
                event.preventDefault();
            }
        });
    };
});

gigzagApp.directive('loading', ['$http', function ($http) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        scope.isLoading = function () {
            if ((scope.$$childHead && scope.$$childHead.disableLoading) || (scope.$$childHead && scope.$$childHead.$parent && scope.$$childHead.$parent.disableLoading)) {
                return false;
            }
          return $http.pendingRequests.length > 0;
        };
        scope.$watch(scope.isLoading, function (value) {
          if (value) {
            element.removeClass('ng-hide');
          } else {
            element.addClass('ng-hide');
          }
        });
      }
    };
}]);
