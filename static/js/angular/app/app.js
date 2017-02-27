'use strict';

function getPartial(template) {
    return '/static/js/angular/app/partials/' + template;
}

var gigzagApp = angular.module('gigzagApp', ['ngRoute', 'gigServices', '720kb.datepicker', '720kb.socialshare', 'uiSwitch', 'xeditable', 'google.places', 'rzModule', 'angular-jquery-locationpicker', 'jkuri.timepicker', 'ngTagsInput'])

    // Configure angularJS app
    .config(function($interpolateProvider, $httpProvider, $routeProvider){

        // Define custom start and end symbols to be used
        // in template expressions so that angular symbols
        // do not conflict with django symbols as both
        // of them use `{{` and `}}` as starting and ending
        // symbols in the template.
        $interpolateProvider.startSymbol('{@');
        $interpolateProvider.endSymbol('@}');

        // Define app routes
        $routeProvider.when('/gigs', {
            templateUrl: getPartial('gigs.html'),
            controller: gigsListController
        })

        $routeProvider.when('/gigs/:gigid', {
            templateUrl: getPartial('gigs.html'),
            controller: gigsListController
        })

        // Define app routes
        $routeProvider.when('/me', {
            templateUrl: getPartial('me.html'),
            controller: meController
        })

        $routeProvider.when('/create', {
            templateUrl: getPartial('create.html'),
            controller: createController
        })

        $routeProvider.when('/create/:gigid', {
            templateUrl: getPartial('create.html'),
            controller: createController
        })

        $routeProvider.when('/settings', {
            templateUrl: getPartial('settings.html'),
            controller: settingsController
        })

        $routeProvider.when('/notifications', {
            templateUrl: getPartial('notifications.html'),
            controller: notificationsController
        })

        .otherwise({
            redirectTo: '/gigs'
        })
    });

gigzagApp.run(function($rootScope){
    var ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    $rootScope.query = "";
    $rootScope.isSearchActive = false;
    $rootScope.showdp = false;
    $rootScope.gigdate = null;
	$rootScope.rel = null;
    $rootScope.showCalendar = true;
    $rootScope.toggleSearch = function() {
        var $search = $('input.search');
        if ($search.hasClass('active')) {
            $search.removeClass('active');
            $rootScope.isSearchActive = false;
        } else {
            $search.addClass('active');
            $search.focus();
            $rootScope.isSearchActive = true;
        }
    };

    $rootScope.cancelSearch = function() {
        $('input.search').removeClass('active');
        $rootScope.isSearchActive = false;
    };

    $rootScope.performSearch = function() {
        $rootScope.query = angular.element('input.search')[0].value;
        if ($rootScope.query !== "") {
            $('input.search').blur();
            hideKeyboard($('input.search'));
            $rootScope.isSearchActive = false;
            window.location.href = '/#/gigs?query=' + $rootScope.query;
        }
    };

    $rootScope.selectDate = function (e) {
        $rootScope.showdp = $rootScope.showdp === true ? false : true;
        if ($rootScope.$$childTail && $rootScope.$$childTail.showdpc) {
            $rootScope.$$childTail.showdpc = false;
        };
	var icon = $('span.icon-calendar');
	if (icon.hasClass('active')) {
	    icon.removeClass('active');
	} else {
	    icon.addClass('active');
	}
    };

    $rootScope.$watch('gigdate', function(val){
        if (!(val === undefined) && !(val === null)) {
            $rootScope.getFilteredGigs('date');
        }
    });

    $rootScope._cl = function() {
        if (window._RX === -1){
            window.location.href = "/login";
        }
    };

    if (ios && ios === true) {
        angular.element(document.body).addClass('ios');
    }

    $rootScope.getFilteredGigs = function(arg) {
		$rootScope.rel = arg;
        window.location.href = '/#/gigs';
    };

    $rootScope.resetSecondaryBar = function() {
        console.log('clear');
    };
});
