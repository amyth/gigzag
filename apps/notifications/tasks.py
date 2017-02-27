#!/usr/bin/python
# -*- coding: utf-8 -*-
#
########################################
##
# @author:          Amyth
# @email:           mail@amythsingh.com
# @website:         www.techstricks.com
# @created_date: 13-10-2016
# @last_modify: Mon Nov  7 14:14:41 2016
##
########################################


from config.celery import app
from apps.notifications.utils import create_gig_going_reminder


@app.task
def create_going_to_gig_reminder(user, gig):
    try:
        create_gig_going_reminder(user, gig)
    except Exception as err:
        pass
