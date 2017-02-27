#!/usr/bin/python
# -*- coding: utf-8 -*-
#
########################################
##
# @author:          Amyth
# @email:           mail@amythsingh.com
# @website:         www.techstricks.com
# @created_date: 13-10-2016
# @last_modify: Fri Nov 11 03:21:20 2016
##
########################################

import os
import uuid

from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from config.celery import app

TEMPLATES = {
    'welcome': {
        'subject':'Welcome to Gigzag!',
        'html': 'emails/html/welcome.html',
    },
    'going': {
        'subject':'Going to gig confirmation',
        'html': 'emails/html/going.html',
    },
    'going_reminder': {
        'subject':'Hurry! The gig is starting',
        'html': 'emails/html/going_reminder.html',
    },
    'friend_going': {
        'subject':'Your friend is also going!',
        'html': 'emails/html/friend_going.html',
    },
    'new_friend': {
        'subject':'Your friends are on gigzag',
        'html': 'emails/html/new_friend.html',
    },
    'hosting': {
        'subject':'Your friend is hosting a Gig',
        'html': 'emails/html/hosting.html',
    },
    'inactive': {
        'subject':'We miss you at Gigzag!',
        'html': 'emails/html/inactive.html',
    },
}

@app.task
def send_email(template, recipient, context=None):
    try:
        template_data = TEMPLATES.get(template)
        if template_data:
                subject = template_data.get('subject')
                from_email = template_data.get('from', 'hello@gigzag.in')
                template = template_data.get('html')
                html_content = render_to_string(template, context)
                text_content = strip_tags(html_content)
                message = EmailMultiAlternatives(subject, text_content,
                        from_email, [recipient])
                message.attach_alternative(html_content, 'text/html')
                message.send()
        return True
    except Exception as err:
        print str(err)
        return False
