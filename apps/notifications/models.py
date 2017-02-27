from django.db import models


class UserNotification(models.Model):

    action = models.ForeignKey("actstream.Action")
    user = models.ForeignKey("auth.User")
    unread = models.BooleanField(default=True)
    important = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __unicode__(self):
        return u'%s' % self.action
