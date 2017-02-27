import os
import uuid

from django.contrib.auth.models import User
from django.contrib.contenttypes.fields import GenericRelation
from django.core.files import File
from django.db import models
from django.db.models import Q

from django_comments.models import Comment
from liked.models import Like
from moviepy.editor import VideoFileClip

from apps.gigs import choices
from core.models import SluggedModel
from utils.choices import GIG_PRIVACY_LEVELS


GIG_TYPES = (
    (1, 'Public Gig'),
    (2, 'Home Gig'),
)

GIG_STATUSES = (
    (0, 'Inactive'),
    (1, 'Active'),
)


class GigLocation(models.Model):
    address = models.TextField()
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True,
            null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True,
            null=True)
    city = models.CharField(max_length=5, choices=choices.CITIES)

    def __unicode__(self):
        return u'%s, %s' % (self.address, self.get_city_display())


class Gig(SluggedModel):

    ## Core fields
    description = models.TextField(blank=True, null=True)
    gigtime = models.DateTimeField(blank=True, null=True)
    gig_type = models.IntegerField(choices=GIG_TYPES, default=1)
    no_of_pax = models.IntegerField(default=0)
    location = models.ForeignKey(GigLocation, blank=True, null=True)
    artists = models.ManyToManyField("accounts.Artist", blank=True)
    tags = models.ManyToManyField("tags.Tag", blank=True)
    cover = models.ImageField(upload_to="images/cover/", null=True, blank=True)
    video = models.FileField(upload_to="video/cover", null=True, blank=True)
    youtube_link = models.URLField(null=True, blank=True)

    ## activity fields
    likes = GenericRelation(Like)
    comments = GenericRelation(Comment, object_id_field='object_pk')

    ## contact fields
    band_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=14, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)

    ## settings and privacy
    privacy = models.IntegerField(choices=GIG_PRIVACY_LEVELS, default=1)

    ## Backend fields
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    status = models.IntegerField(choices=GIG_STATUSES, default=1)
    moderated = models.BooleanField(default=False)

    created_by = models.ForeignKey(User, related_name='created_gigs')
    rsvp = models.ManyToManyField(User, related_name='went_to', blank=True)


    def __unicode__(self):
        return u'%s' % self.title

    def save(self, *args, **kwargs):
        url = self.youtube_link
        if self.youtube_link:
            if 'youtu.be' in url:
                vid = url.split('/')[-1]
                url = "https://www.youtube.com/embed/%s" % vid
            elif 'watch?v=' in url:
                url = url.replace('watch?v=', "embed/")
        self.youtube_link = url.split('&')[0]
        return super(Gig, self).save(*args, **kwargs)

    @property
    def human_time(self):
        human_date = self.gigtime.date().strftime('%d/%m/%Y')
        human_time = self.gigtime.strftime('%I:%M %p')

        return '%s, %s' % (human_date, human_time)

    @property
    def detail_link(self):
        return "http://gigzag.in/#/gigs/%s" % self.id

    @property
    def host_history(self):
        gigs = self.created_by.created_gigs.filter(~Q(id=self.id), moderated=True)
        return ",".join([gig.title for gig in gigs][:5])

    @property
    def v_youtube_link(self):
        return self.youtube_link.replace('embed', 'v')

    @property
    def v_youtube_image(self):
	iurl = "https://i.ytimg.com/vi/%s/sddefault.jpg"
	vid = self.youtube_link.split('/')[-1]
	print iurl % vid
        return iurl % vid

