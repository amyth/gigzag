#!/usr/bin/python
# -*- coding: utf-8 -*-
#
########################################
##
# @author:          Amyth
# @email:           mail@amythsingh.com
# @website:         www.techstricks.com
# @created_date: 13-10-2016
# @last_modify: Sun Oct 16 00:25:51 2016
##
########################################

import os
import uuid

from django.core.files import File
from config.celery import app

from moviepy.editor import VideoFileClip


@app.task
def create_cover(gig):

    if gig.video:
        clip = VideoFileClip(gig.video.path)
        ftc = int(round(clip.duration /2))
        tname = uuid.uuid4().__str__()
        tpath = os.path.abspath(os.path.join("/tmp", "%s.jpg" % tname))
        clip.save_frame(tpath, t=ftc)
        with open(tpath, 'r') as tfile_object:
            gig.cover.save(tname, File(tfile_object))
        os.remove(tpath)
        return True
