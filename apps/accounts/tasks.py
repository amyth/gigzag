#!/usr/bin/python
# -*- coding: utf-8 -*-
#
########################################
##
# @author:          Amyth
# @email:           mail@amythsingh.com
# @website:         www.techstricks.com
# @created_date: 13-10-2016
# @last_modify: Fri Nov 11 03:14:46 2016
##
########################################

from config.celery import app

from apps.home.tasks import send_email


@app.task
def assign_friends(user, friend_ids):
    """
    Assign friends both ways.
    """
    try:
        from allauth.socialaccount.models import SocialAccount
        saccounts = SocialAccount.objects.filter(uid__in=friend_ids)
        friends = [x.user for x in saccounts]
        profile = user.profile_set.first()

        for friend in friends:
            if not friend in profile.friends.all():
                profile.friends.add(*friends)
                other = [x for x in friend if x != friend]
                send_email.apply_async(('new_friend', user.email,
                    {'friend': friend, 'other': other}))
            friend_profile = friend.profile_set.first()
            friend_profile.friends.add(user)
            fother = friend_profile.friends.all()
            fother = [x for x in fother if x != user]
            send_email.apply_async(('new_friend', friend.email,
                {'friend': user, 'other': fother}))

        return True
    except Exception as err:
        ## Log Error
        return False
