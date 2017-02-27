'use strict';

angular.module('gigServices', ['ngResource'])

    .config(function($httpProvider, $resourceProvider){
        $httpProvider.defaults.headers.post["Content-Type"] = "application/json";
        $httpProvider.defaults.xsrfCookieName = 'csrftoken';
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
        $resourceProvider.defaults.stripTrailingSlashes = false;
    })

    // Gigs Service
    .factory('gigService', function($resource){
        var baseUrl = '/api/v1/gigs/',
            gigs = $resource(baseUrl, {}, {
                'list':  {
                    method: 'GET',
                },
                'update': {
                    method: 'PUT',
                }
            });

        return gigs;
    })

    // Tags Service
    .factory('suggestedTagService', function($resource){
        var baseUrl = '/api/v1/suggested/',
            tags = $resource(baseUrl, {}, {
                'list':  {
                    method: 'GET',
                },
            });

        return tags;
    })

    // Goto Gig Service
    .factory('goToService', function($resource){
        var baseUrl = '/api/v1/goto/:gigId/',
            gotogig = $resource(baseUrl);

        return gotogig;
    })

    // User rsvpd Service
    .factory('rsvpService', function($resource){
        var baseUrl = '/api/v1/wentto/',
            went = $resource(baseUrl, {}, {
                'fetch': {
                    method: 'GET',
                    isArray: true
                }
            });

        return went;
    })

    // Like gig service
    .factory('likeService', function($resource){
        var baseUrl = '/api/v1/like/gig/:gigId/',
            liked = $resource(baseUrl);

        return liked;
    })

    .factory('currentUserService', function($resource){
        var baseUrl = '/api/v1/cu/',
            liked = $resource(baseUrl);

        return liked;
    })

    // My Profile Service
    .factory('myProfileService', function($resource){
        var baseUrl = '/api/v1/mygigs/',
            gigs = $resource(baseUrl, {}, {
                'list':  {
                    method: 'GET',
                }
            });

        return gigs;
    })

    // Profile Settings Service
    .factory('profileSettingsService', function($resource){
        var baseUrl = '/api/v1/settings/',
            settings = $resource(baseUrl, {}, {
                'get':  {
                    method: 'GET',
                },
                'post': {
                    method: 'POST',
                }
            });

        return settings;
    })

    // Comment Service
    .factory('commentService', function($resource){
        var baseUrl = '/api/v1/comments/',
            gigs = $resource(baseUrl, {}, {
                'list':  {
                    method: 'GET',
                },
                'post': {
                    method: 'POST',
                },
            });

        return gigs;
    })

    .factory('navigateService', function(){
        return {
            goTo: function(url) {
                window.location.href = "/#/" + url;
            }
        };
    })

    .factory('notifyService', function(){
        return {
            error: function(message) {
                var elm = angular.element('<span class="nfService nfErr shake-constant shake-horizontal">' + message + '</span>');
                angular.element(document.body).append(elm);
                setTimeout(function(){
                    $('.nfService').removeClass('shake-constant shake-horizontal');
                }, 200);
                setTimeout(function(){
                    $('.nfService').fadeOut(500);
                }, 1500);
                setTimeout(function(){
                    $('.nfService').remove();
                }, 2500);
            },

            success: function(message) {
                var elm = angular.element('<span class="nfService nfSuc shake-constant shake-horizontal">' + message + '</span>')
                angular.element(document.body).append(elm);
                setTimeout(function(){
                    $('.nfService').removeClass('shake-constant shake-horizontal');
                }, 200);
                setTimeout(function(){
                    $('.nfService').fadeOut(500);
                }, 1500);
                setTimeout(function(){
                    $('.nfService').remove();
                }, 2500);
            }
        };
    })


    .factory('validationService', function(){
        return {
            validate: function(validators) {
                var that = this;
                var error = false;
                var errorMessage;
                _.each(validators, function(validator) {
                    if (!(error)) {
                        var name = validator.name;
                        var value = validator.value;
                        var validations = validator.validations;
                        _.each(validations, function(validation){
                            if (!(typeof that[validation] === "function")) {
                                var mssg = "validationService has no method " + validation;
                                error = true;
                                errorMessage = mssg;
                                return false;
                            } else {
                                var valid = that[validation](validator.name, validator.value);
                                if (!(valid === true)) {
                                    error = true;
                                    errorMessage = valid;
                                    return false;
                                }
                            }
                        });
                    } else {
                        return false;
                    }
                });
                if (error) {
                    return errorMessage;
                }
                return true;
            },
            required: function(name, value) {
                 if (value === undefined || value === "" || value === null) {
                     return name + " is required";
                 }
                 return true;
            }
        };
    })

    // Notification Service
    .factory('notificationService', function($resource){
        var baseUrl = '/api/v1/notifications/',
            noti = $resource(baseUrl, {}, {
                'list':  {
                    method: 'GET',
                },
            });

        return noti;
    })
    // Mark Read Service
    .factory('markService', function($resource){
        var baseUrl = '/api/v1/mark/',
            result = $resource(baseUrl, {}, {
                'get':  {
                    method: 'GET',
                },
            });

        return result;
    })

