/**
 * List controller that handles a list of gigs
 */

function gigsListController($scope, $rootScope, $sce, $window, $http, $routeParams,
        gigService, goToService, rsvpService, currentUserService,
        commentService,
        likeService) {


    $scope.gigs = [];
    $scope.gigComments = [];
    $scope.ursvp = [];
    $scope.urlparams = {};
    $scope.query = "";
    $scope.nextPage = null;
    $scope.nextComments = null;
    $scope.currentTab = 'gigs';
    $scope.ismobile = window.mobilecheck();
    $scope.currentGigIndex = 0;
    $scope.currentUser = null;
    $scope.isYTPlaying = false;
    $scope.fullAddress = false;
    $scope.showConfirmGo = false;


    $scope.trustSrc = function(src) {
        return $sce.trustAsResourceUrl(src + "?version=3&enablejsapi=1");
    };

    $scope.playYoutubeVideo = function($event) {
        var $video = $($event.currentTarget).siblings('iframe');
        if (!($scope.isYTPlaying)) {
            $video.each(function(){
                this.contentWindow.postMessage('{"event":"command","func":"' + 'playVideo' + '","args":""}', '*')
            });
            $scope.isYTPlaying = true;
        } else {
            $scope.stopYoutubeVideo();
        }
    };
    $scope.stopYoutubeVideo = function($event) {
        $('iframe').each(function(){
            this.contentWindow.postMessage('{"event":"command","func":"' + 'stopVideo' + '","args":""}', '*')
        });
        $scope.isYTPlaying = false;
    };

    $scope.getGigs = function(initial) {
        if (!($routeParams.query === undefined)) {
            $scope.urlparams.tag = $routeParams.query;
        }
        if (!($routeParams.gigid === undefined)) {
            $scope.urlparams._gid = $routeParams.gigid;
        }

        // Gets a list of gigs
        gigService.list($scope.urlparams, function(data){
            $scope.gigs = [];
            $scope.nextPage = data.next;
            _.each(data.results, function(gig){
                $scope.gigs.push(gig);
            });
            $rootScope.rel = $scope.rel = null;
        });
    };

    $scope.getMoreGigs = function() {
        $http.get($scope.nextPage).then(function(data){
            $scope.nextPage = data.data.next;
            _.each(data.data.results, function(gig){
                $scope.gigs.push(gig);
            });
        });
    };

    $scope.getFilteredGigs = function(t) {
        $scope.resetSecondaryBar();
        $scope.secondaryTab = t;
        switch (t) {
            case 'date':
                delete $scope.urlparams.df;
                $scope.urlparams.dt = $scope.gigdate;
                break;
            case 'all':
                delete $scope.urlparams.dt;
                delete $scope.urlparams.df;
			case 'weekend':
				delete $scope.urlparams.dt;
            default:
				delete $scope.urlparams.dt;
                $scope.urlparams.df = t;
        }
        $scope.getGigs();
    };

    $scope.getTaggedGigs = function(e) {
        $scope.urlparams.tag = e.currentTarget.innerText.toLowerCase();
        $scope.getGigs();
    };

    $scope.commentClick = function() {
        $scope.toggleComments();
        var gig = $scope.gigs[$scope.currentGigIndex];
        $('textarea#postcomment_' + gig.id).focus();
    };

    $scope.goToGig = function(e) {
        var gig = $scope.gigs[$scope.currentGigIndex];
        goToService.get({gigId: gig.id}, function() {
            $scope.ursvp.push(gig.id);
            $scope.showConfirmGo = false;
        }, handleResourceErrors);
    };

    $scope.getRsvp = function() {
        if (window._RX > 0) {
            rsvpService.fetch(function(data){
                $scope.ursvp = data;
            });
        }
    };

    $scope.going = function() {
        var gig = $scope.gigs[$scope.currentGigIndex];
        if (!(gig === undefined) && $scope.ursvp.includes(gig.id)) {
            return true;
        }
        return false;
    };

    $scope.likeGig = function(gig) {
        if (!(gig.has_liked)) {
            likeService.get({gigId: gig.id}, function(data){
                gig.has_liked = true;
                gig.like_count += 1;
            }, handleResourceErrors);
        }
    }

    $scope.getGigUrl = function() {
        var gig = $scope.gigs[$scope.currentGigIndex];
        var url = window.location.origin + '/#/gigs/' + gig.id;
        return url;
    };

    $scope.toggleSharer = function() {
        var gig = $scope.gigs[$scope.currentGigIndex];
        $('#sharer_' + gig.id).toggleClass('active');
    };

    $scope.showContact = function() {
        var gig = $scope.gigs[$scope.currentGigIndex];
        $('#contact_' + gig.id).toggleClass('active');
    };

    $scope.cancelComment = function() {
        var gig = $scope.gigs[$scope.currentGigIndex];
        $('textarea#postcomment_' + gig.id).val("");
    };

    $scope.postComment = function() {
        var gig = $scope.gigs[$scope.currentGigIndex];
        var commVal = $('textarea#postcomment_' + gig.id).val();
        if (!(commVal === undefined) && !(commVal === "")) {
            commentService.post({"comment": commVal, "object_pk": gig.id},
                function(data){
                    gig.comment_count += 1;
                    $('textarea#postcomment_' + gig.id).val("");
                    $scope.gigComments.unshift(data);
                    setTimeout(function(){
                        var xhe = document.getElementById('comments_for_'+gig.id).offsetHeight;
                        resetSlider(xhe);
                    }, 200);
            });
        };
    };

    $scope.resetComments = function() {
        $scope.gigComments = [];
        $scope.nextComments = null;
        $('.xcomm').addClass('contracted');
        $('.comments').addClass('contracted');
        resetSlider(0);
    };

    $scope.loginRedirect = function() {
        window.location.href = "/login/";
    }

    $scope.toggleComments = function() {
        //$(e.currentTarget).toggleClass('contracted');
        var gig = $scope.gigs[$scope.currentGigIndex];
        $('#comments_for_' + gig.id).toggleClass('contracted');

        if (!($('#comments_for_' + gig.id).hasClass('contracted'))) {
            $scope.loadComments();
        } else {
            setTimeout(function(){
                var xhe = document.getElementById('comments_for_'+gig.id).offsetHeight;
                resetSlider(xhe);
            },400);
        }

        // toggle address
        if ($scope.fullAddress === false) {
            $scope.fullAddress = true;
        } else {
            $scope.fullAddress = false;
        }
    };

    $scope.$watch(function(){
        return $window.SPSLIND;
    }, function(n, o){
        if (n !== undefined) {
            $scope.currentGigIndex = n;
        }
        $('.sharer').removeClass('active');
        var secondLast = $scope.gigs.length - 2;
        if (n >= secondLast && $scope.nextPage !== null) {
            $scope.getMoreGigs();
        }
        setTimeout(function(){ $scope.resetComments(); },700);
    });

    $scope.$watch('gigdate', function(val){
        if (!(val === undefined) && !(val === null)) {
            $rootScope.showdp = false;
            $scope.getFilteredGigs('date');
        }
    });

    $scope.getCurrentUser = function() {
        currentUserService.get(function(data){
            $scope.currentUser = data.user;
        });
    };

    $scope.loadComments = function() {
        var gig = $scope.gigs[$scope.currentGigIndex];
        $scope.disableLoading = true;
        commentService.get({"gigid": gig.id},
            function(data){
            $scope.disableLoading = false;
            if (data.next) {
                $scope.nextComments = data.next;
            }
            $scope.gigComments = data.results;
            setTimeout(function(){
                var xhe = document.getElementById('comments_for_'+gig.id).offsetHeight;
                resetSlider(xhe);
            },400);
        });
    };

    $scope.loadMoreComments = function() {
        var gig = $scope.gigs[$scope.currentGigIndex];
        $http.get($scope.nextComments).then(function(data){
            $scope.nextComments = data.data.next;
            _.each(data.data.results, function(c){
                $scope.gigComments.push(c);
            });
            setTimeout(function(){
                var xhe = document.getElementById('comments_for_'+gig.id).offsetHeight;
                resetSlider(xhe);
            },400);
        });
    };

    $scope.getConfirmText = function() {
        var gig = $scope.gigs[$scope.currentGigIndex];
        return "Would you like to go to " + gig.title + " ?";
    };

    $scope.confirmGoing = function() {
        $scope.showConfirmGo = true;
    };

    $scope.cancelConfirmation = function() {
        $scope.showConfirmGo = false;
    };


    // Initial actions
    $scope.getRsvp();
    $scope.getCurrentUser();
    if (!($scope.rel === undefined)) {
        $scope.getFilteredGigs($scope.rel);
    } else {
        $scope.getGigs(true);
    }
}


/**
 * List controller for a user profile that is logged in.
 * This controller will list all the gigs uploaded by the
 * logged in user.
 */

function meController($scope, myProfileService, gigService, navigateService) {

    $scope._cl();
    $scope.currentTab = 'me';
    $scope.gigs = [];
    $scope.goTo = navigateService.goTo;
    $scope.ismobile = window.mobilecheck();
    $scope.primaryActiveIcon = 'profile';

    $scope.getGigs = function(initial) {
        myProfileService.list(function(data){
            _.each(data.results, function(gig){
                $scope.gigs.push(gig);
            });
        }, handleResourceErrors);
    };

    $scope.changeGigStatus = function(gig) {
        var _status = gig.is_active ? 1 : 0;
        var data = {
            "gigtime": gig.gigtime,
            "title": gig.title,
            "status": _status
        }
        gigService.update({gigid: gig.id}, data, function(d){
        });
    };

    $scope.toggleSharer = function(gig) {
        $('#sharer_' + gig.id).toggleClass('active');
    };

    $scope.getGigUrl = function(gig) {
        var url = window.location.origin + '/#/gigs/' + gig.id;
        return url;
    };

    // Fetch the list of gigs and add'em
    // to the scope
    $scope.getGigs(true);
    angular.element(window.document.body).ready(function(){
        bindEvents();
    });
}


/**
 * create a new gig controller.
 */
function createController($scope, $filter, $sce, $http, $routeParams, gigService, navigateService, validationService, notifyService) {
    $scope._cl();
    $scope.hideFilters = $scope.uploadScreen = true;
    $scope.step = 1;
    $scope.primaryActiveIcon = 'create';
    $scope.currentTab = 'me';
    $scope.goTo = navigateService.goTo;
    $scope.vFile = null;
    $scope.cFile = null;
    $scope.showYoutube = false;
    $scope.post_to = 1;
    $scope.userShareText = "";
    $scope.disableLoading = false;
    $scope.showTags = false;
	$scope.showdpc = false;
    $scope.showCalendar = false;
    $scope.plevels = [
        {value: 1, text: "Everyone"},
        {value: 2, text: "Friends"},
        {value: 3, text: "Friends of Friends"},
    ];
    $scope.cities = [
	    {value: 'del', text: 'Delhi NCR'},
    	{value: 'gur', text: 'Gurgaon'},
	    {value: 'mum', text: 'Mumbai'},
		{value: 'ban', text: 'Bangalore'},
		{value: 'hyd', text: 'Hyderabad'},
		{value: 'kol', text: 'Kolkata'},
		{value: 'pun', text: 'Pune'},
		{value: 'che', text: 'Chennai'},
	        {value: 'goa', text: 'Goa'},
	        {value: 'chd', text: 'Chandigarh'},
	        {value: 'oth', text: 'Others'},
    ];

    $scope.gigtypes = [
        {value: 1, text: "Public Gig"},
        {value: 2, text: "Home Gig"},
    ];

    $scope.plevels_share = {
        "Anyone": 1,
        "Friends of Friends": 3,
        "Friends": 2
    };

    $scope.locationOptions = {
        location: {
            latitude: 28.6299,
            longitude: 77.2195
        },
        inputBinding: {
            latitudeInput: $('#latitude'),
            longitudeInput: $('#longitude'),
            locationNameInput: $('#address'),
        },
        radius: 2,
        enableAutoComplete: true,
        settings: {
            streetViewControl: true,
        },
        onchanged: function() {
            $scope.step2_data.location_name = $('#address').val();
            $scope.step2_data.latitude = $('#latitude').val();
            $scope.step2_data.longitude = $('#longitude').val();
            $scope.$apply();
        },
        markerOnClick: true,
        markerInCenter: true,
    };

    $scope.gig = {
        location: {
            address: "",
            latitude: null,
            longitude: null,
			city:"del",
        },
        gig_type: 1,
        privacy: 1,
        tags: null
    };

    $scope.step1_data = {
        youtube_link: "",
    };

    $scope.step2_data = {
        location_name: "",
		location_city: "del",
    }

	$scope.showCity = function() {
		var selected = $filter('filter')($scope.cities, {value: $scope.step2_data.location_city});
		return selected[0].text;
	};

    $scope.autocompleteOptions = {
        componentRestrictions: { country: 'in' },
            types: ['geocode']
    };

    // Load data for existing gigs
    if (!($routeParams.gigid === undefined)) {
        $http.get('/api/v1/gig/' + $routeParams.gigid + '/', {}).success(function(data){
            setTimeout(function(){
                $scope.gig = data;
                if ($scope.gig.video && $scope.gig.video.length > 1) {
                    document.getElementById('preview').src = $scope.gig.video;
                };

                if ($scope.gig.youtube_link && $scope.gig.youtube_link.length > 1) {
                    $scope.step1_data.youtube_link = $scope.gig.youtube_link;
                    $scope.showYoutube = true;
                    $scope.$apply();
                }

                $scope.gig.date = $scope.gig.date_slash;
                $scope.gig.artist = $scope.gig.band_name;
                $scope.gig.time = $scope.gig.timings.split(" ")[0];
                $scope.gig.no_of_guests = $scope.gig.no_of_pax;
                $scope.gig.mobile = $scope.gig.phone;

                $scope.step2_data.location_name = $scope.gig.location.address;
                $scope.step2_data.latitude = $scope.gig.location.latitude;
                $scope.step2_data.longitude = $scope.gig.location.longitude;
                //$scope.step2_data.location_name = $('#address').val();
                //$scope.step2_data.latitude = $('#latitude').val();
                //$scope.step2_data.longitude = $('#longitude').val();
            }, 1000)
        }, function(err){
            if (err.status === 404) {
                window.location.href = "/#/gigs"
            }
        });
    };

    $scope.showPrivacy = function() {
        var selected = $filter('filter')($scope.plevels, {value: $scope.gig.privacy});
        return selected[0].text;
    };

    $scope.showGigTypes = function() {
        var selected = $filter('filter')($scope.gigtypes, {value: $scope.gig.gig_type});
        return selected[0].text;
    };

    $scope.chooseVideo = function(e) {
        $scope.showYoutube = false;
        $scope.step1_data.youtube_link = "";
        $('input#uploader').removeAttr('capture');
        document.getElementById('uploader').click();
    };

    $scope.captureVideo = function(e) {
        $scope.showYoutube = false;
        $scope.step1_data.youtube_link = "";
        $('input#uploader').attr('capture', 'camera');
        document.getElementById('uploader').click();
    };

    $scope.chooseCover = function(e) {
        document.getElementById('cover').click();
    };


    console.log($('#uploader'));
    $('#uploader').on('change', function() {
        $scope.vFile = this.files[0];
        if (!($scope.vFile === undefined || $scope.vFile === null)) {
            var objectUrl = URL.createObjectURL($scope.vFile);
            document.getElementById('preview').src = objectUrl;
        }
        $scope.$apply();
    });

    console.log($('#cover'));
    $('#cover').on('change', function() {
	$scope.cFile = this.files[0];
        if (!($scope.cFile === undefined || $scope.cFile === null))  {
	    var src = document.getElementById('preview').src
	    document.getElementById('preview').src = null;
	    document.getElementById('preview').setAttribute('poster', URL.createObjectURL($scope.cFile));
	    document.getElementById('preview').src = src;
        }
	$scope.$apply();
    });
    $scope.$watch('place', function(v) {
        if (typeof v === "object") {
            $scope.gig_location = v.formatted_address;
            $scope.gig.location.address = v.formatted_address;
            $scope.gig.location.latitude = v.geometry.location.lat();
            $scope.gig.location.longitude = v.geometry.location.lng();
            $('#gpa').blur();
        }
    });

    $scope.uploadGig = function() {
        if($scope.validateStepOne() && $scope.validateStepTwo()) {
            var data = $scope.prepareRawData();
            $scope.uploadRequest(data);
        } else {
            notifyService.error(valid);
        };
    };

    $scope.validateStepOne = function() {
        if (!($scope.step1_data.youtube_link.length > 1) && (!(($('#uploader').val().length > 1) || ($scope.gig.video && $scope.gig.video.length > 1)))) {
            notifyService.error("Please either upload a video or add a youtube video to continue.");
            return false;
        }

        return true;
    };

    $scope.validateStepTwo = function() {
        $scope.gigValidators = [
            {name: "Gig title", value: $scope.gig.title, validations:["required"]},
            {name: "Artist / Band name", value: $scope.gig.artist, validations:["required"]},
            {name: "No. of Guests", value: $scope.gig.no_of_guests, validations:["required"]},
            {name: "Location", value: $scope.step2_data.location_name, validations:["required"]},
            {name: "Email", value: $scope.gig.email, validations:["required"]},
        ];
        var valid = validationService.validate($scope.gigValidators);
        if(valid === true) {
            return true;
        } else {
            notifyService.error(valid);
        };
        return false;
    }

    $scope.uploadRequest = function(data) {
        var formData = new FormData();
        formData.append('data', angular.toJson(data));
        formData.append('file', $scope.vFile);
        formData.append('cover', $scope.cFile);

        $http.post('/api/v1/create/', formData,{
            headers: {'Content-Type': undefined},
            transformRequest: angular.identity
        })
        .success(function(resp){
            $scope.gig = resp.gig;
            $scope.step = 3;
        })
        .error(function(resp){
            notifyService.error(resp.message);
        });
    };

    $scope.addYoutubeVideo = function(e) {
        var ytval = $scope.normalizeYoutubeLink($('input#youtube_link').val());
        $scope.step1_data.youtube_link = ytval;
    };

    $scope.normalizeYoutubeLink = function(url) {
        if (url.indexOf('youtu.be') > -1) {
            var uSplit = url.split("/");
            var vID = uSplit[uSplit.length -1];

            url = "https://www.youtube.com/embed/" + vID;
            return url.split("&")[0];
        }
        if (url.indexOf('watch?v=') > -1) {
            url = url.replace("watch?v=", "embed/");
            return url.split("&")[0];
        }

        return url.split("&")[0];
    };

    $scope.showYoutubeInfo = function(e) {
        $scope.showYoutube = true;
        $('input#youtube_link').focus();
    };

    $scope.trustSrc = function(src) {
        return $sce.trustAsResourceUrl(src);
    };

    $scope.stepOne = function() {
        $scope.step = 1;
    };

    $scope.stepTwo = function() {
        if ($scope.validateStepOne()) {
            $scope.step = 2;
        }
    };

    $scope.stepThree = function() {
        if ($scope.validateStepOne() && $scope.validateStepTwo()) {
            if ($scope.gig.id) {
                $scope.step = 3;
            } else {
                var err = "You must first upload the gig before sharing it."
                notifyService.error(err);
            }
        }
    }

    $scope.prepareRawData = function() {
        data = {};
        data.email = $scope.gig.email;
        data.mobile = $scope.gig.mobile;
        data.youtube_link = $scope.step1_data.youtube_link;
        data.title = $scope.gig.title;
        data.artist = $scope.gig.artist;
        data.date = $scope.gig.date;
        data.time = $scope.gig.time;
        data.location = {
            address: $scope.step2_data.location_name,
            latitude: $scope.step2_data.latitude,
            longitude: $scope.step2_data.longitude,
            city: $scope.step2_data.location_city,
        };
        data.no_of_guests =  $scope.gig.no_of_guests;
        data.description = $scope.gig.description;
        data.privacy = $scope.gig.privacy;
        data.tags = $scope.gig.tags;

        if ($scope.gig.id) {
            data.id = $scope.gig.id;
        }
        return data;
    };

    $scope.updatePostedBy = function(val) {
        $scope.post_to = val;
    };

    $scope.getShareText = function() {
        return $scope.userShareText || "Check out this amazing gig '" + $scope.gig.title + "' at Gigzag.";
    };

    $scope.getShareUrl = function() {
        return window.location.origin + "/#/gigs/" +  $scope.gig.id + "/"
    };

    $scope.getShareMedia = function() {
        return $scope.gig.cover;
    };

    angular.element(window.document.body).ready(function(){
        setTimeout(function(){
            bindEvents();
            // cover change event
            $('input#cover').on('change', function() {
                $scope.cFile = this.files[0];
                $scope.$apply();
            });
        },2000);
    });

    $scope.$watch('gig.date', function(){
        $scope.showdpc=false;
    });

    $scope.loadTags = function(query) {
        $scope.disableLoading = true;
        return $http.get('/api/v1/tags?query='+ query,{
        }).success(function(data){
            $scope.disableLoading = false;
            return data;
        });
    };

    $scope.toggleTags = function() {
        $scope.showTags = $scope.showTags === true ? false : true;
        if ($scope.showTags === true) {
            $('.tags input').focus();
        }
    };

    $scope.getFirstTag = function() {
        if ($scope.gig.tags && $scope.gig.tags.length > 0) {
            return $scope.gig.tags[0].title;
        };
        return "Add Gig Category / Genre";
    };

     $scope.selectDate = function (e) {
         $scope.showdpc = $scope.showdpc === true ? false : true;
     };
}


/**
 * Profile settings controller. Responsible for displaying
 * and updating user profile settings.
 */
function settingsController($scope, profileSettingsService, suggestedTagService) {

    $scope._cl();
    $scope.settings = {};
    $scope.suggested_tags = {};
    $scope.disableLoading = true;
    $scope.secondaryTab = 'settings';
    $scope.plevels = {
        "Anyone": 1,
        "Friends of Friends": 3,
        "Friends": 2
    };
    $scope.cities = [
	    {value: 'del', text: 'Delhi NCR'},
    	{value: 'gur', text: 'Gurgaon'},
	    {value: 'mum', text: 'Mumbai'},
		{value: 'ban', text: 'Bangalore'},
		{value: 'hyd', text: 'Hyderabad'},
		{value: 'kol', text: 'Kolkata'},
		{value: 'pun', text: 'Pune'},
		{value: 'che', text: 'Chennai'},
	        {value: 'goa', text: 'Goa'},
	        {value: 'chd', text: 'Chandigarh'},
	        {value: 'oth', text: 'Others'},
    ];
    $scope.radius_options = {
        floor: 10,
        ceil: 100,
        showSelectionBar: true,
        step: 5,
        translate: function(val) {
            return val + ' km(s)';
        },
        onEnd: function(id, value){
            $scope.updateRadius(value);
        }
    };

    $scope.getSettings = function() {
        profileSettingsService.get(function(data) {
            $scope.settings = data;
        }, handleResourceErrors);
    };

    $scope.updateSettings = function() {
        profileSettingsService.post($scope.settings, function(data){
            //$scope.settings = data;
        }, handleResourceErrors);
    };

    $scope.getTags = function() {
        suggestedTagService.list(function(data){
            $scope.suggested_tags = data.results;
        }, handleResourceErrors);
    };

    $scope.addTag = function(tag) {
        var data = {add_tags: [tag.id]};
        profileSettingsService.post(data, function(resp){
            if (resp.status === "success"){
                $scope.settings.filters.push(tag);
            }
            $scope.suggested_tags = $scope.suggested_tags.filter(function(obj){
                return obj.id !== tag.id;
            })
        });
    };

    $scope.removeTag = function(tag) {
        var data = {remove_tags: [tag.id]};
        profileSettingsService.post(data, function(resp){
            if (resp.status === "success"){
                $scope.settings.filters = $scope.settings.filters.filter(function(obj) {
                    return obj.id !== tag.id;
                });
                $scope.suggested_tags.push(tag);
            }
        });
    };

    $scope.updatePostedBy = function(val) {
        var data = {posted_by: val};
        profileSettingsService.post(data, function(resp){
            if (resp.status === "success") {
                $scope.settings.posted_by = val;
            }
        });
    };

    $scope.$watch('settings.city', function(a, b){
        if ($scope.settings.city !== "" && $scope.settings.city !== undefined) {
            $scope.updateSettings();
        }
    });

    $scope.toggleNearbySwitch = function() {
        var data = {nearby_switch: $scope.settings.nearby_switch};
        profileSettingsService.post(data, function(resp){
        });
    };

    $scope.toggleFilterSwitch = function() {
        var data = {filter_switch: $scope.settings.filter_switch};
        profileSettingsService.post(data, function(resp){
        });
    };

    $scope.updateRadius = function(value) {
        var data = {nearby_radius: $scope.settings.nearby_radius};
        profileSettingsService.post(data, function(resp){
        });
    };

    $scope.getSettings();
    $scope.getTags();
    angular.element(window.document.body).ready(function(){
        bindEvents();
    });
}


function notificationsController($scope, $http, notificationService, markService) {

    $scope._cl();
    $scope.notifications = [];
    $scope.nextPage = null;
    $scope.primaryActiveIcon = 'notifications';

    $scope.getNotifications = function() {
        notificationService.list(function(data){
            $scope.notifications = data.results;
            $scope.nextPage = data.next;
        }, handleResourceErrors);
    };

    $scope.getMoreNotifications = function() {
        $http.get($scope.nextPage).then(function(data){
            $scope.nextPage = data.data.next;
            _.each(data.data.results, function(gig){
                $scope.notifications.push(gig);
            });
        });
    };

    $scope.gigDetails = function(gigid) {
        window.location.href = '/#/gigs/' + gigid + '/';
    };

    $scope.markRead = function() {
        markService.get();
    };

    $scope.getNotifications();

    setTimeout(function(){
        $scope.markRead();
    }, 4000)
    angular.element(window.document.body).ready(function(){
        bindEvents();
    });
}
