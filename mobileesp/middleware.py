#!/usr/bin/python
# -*- coding: utf-8 -*-
#
########################################
##
# @author:          Amyth
# @email:           mail@amythsingh.com
# @website:         www.techstricks.com
# @created_date: 16-11-2016
# @last_modify: Tue Jan  3 15:17:50 2017
##
########################################

import re

from django.shortcuts import redirect
from django.utils.deprecation import MiddlewareMixin

from mobileesp import mdetect


class MobileDetectionMiddleware(MiddlewareMixin):
    """
    Useful middleware to detect if the user is
    on a mobile device.
    """

    def process_request(self, request):
        is_mobile = False
        is_tablet = False
        is_phone = False

        user_agent = request.META.get("HTTP_USER_AGENT")
        http_accept = request.META.get("HTTP_ACCEPT")
        if user_agent and http_accept:
            agent = mdetect.UAgentInfo(userAgent=user_agent,
		    httpAccept=http_accept)
            is_tablet = agent.detectTierTablet()
            is_phone = agent.detectTierIphone()
            is_mobile = is_tablet or is_phone or agent.detectMobileQuick()

        request.is_mobile = is_mobile
        request.is_tablet = is_tablet
        request.is_phone = is_phone

	#if not any([is_mobile, is_tablet, is_phone]) and (
        #        request.path != '/web/') and (
        #        not 'admin' in request.path):
        #    return redirect('/web/')
