from django.db import models

from core.models import SluggedModel


class Tag(SluggedModel):

    def __unicode__(self):
        return u'%s' % self.title
