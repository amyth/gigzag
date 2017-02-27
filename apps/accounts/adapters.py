#!/usr/bin/python
# -*- coding: utf-8 -*-
#
########################################
##
# @author:          Amyth
# @email:           mail@amythsingh.com
# @website:         www.techstricks.com
# @created_date: 14-10-2016
# @last_modify: Sun Dec 25 15:48:17 2016
##
########################################

from allauth.socialaccount.adapter import DefaultSocialAccountAdapter

from apps.accounts.tasks import assign_friends


class GigzagUserAdapter(DefaultSocialAccountAdapter):
    def save_user(self, request, sociallogin, form=None):
        resp = super(GigzagUserAdapter, self).save_user(request,
                sociallogin, form=form)
        try:
            user = sociallogin.user
            data = user.socialaccount_set.first().extra_data['friends']['data']
            if data:
                data = [x['id'] for x in data]
                assign_friends.apply_async((user, data), countdown=1)
        except Exception as err:
            ## Log the error
            pass
        return resp
