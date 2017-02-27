from django.conf import settings
from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import post_save

from apps.gigs.choices import CITIES
from apps.home.tasks import send_email
from core.models import SluggedModel
from utils.choices import GIG_PRIVACY_LEVELS


class Profile(models.Model):
    user = models.ForeignKey(User)
    location = models.CharField(max_length=100, blank=True, null=True)
    friends = models.ManyToManyField(User, related_name="friend_profile")

    @property
    def profile_picture(self):
        custom = 'http://graph.facebook.com/10210496850322671/picture?width=40&height=40'
        p = custom if self.user.id in settings.ADMIN_ACCOUNTS else ''
        if p:
            return custom
        return "http://graph.facebook.com/{}/picture?width=40&height=40".format(
                self.user.socialaccount_set.filter()[0].uid)


class ProfileSettings(models.Model):
    user = models.ForeignKey(User, related_name="settings")
    filter_switch = models.BooleanField(default=False)
    nearby_switch = models.BooleanField(default=False)
    filters = models.ManyToManyField('tags.Tag', related_name="tag_in_settings")
    posted_by = models.IntegerField(default=1, choices=GIG_PRIVACY_LEVELS)
    nearby_radius = models.BigIntegerField(default=20)
    city = models.CharField(max_length=10, choices=CITIES, default='del')


class Artist(SluggedModel):
    pass


def create_profile(sender, **kwargs):
    if kwargs.get('created'):
        user = kwargs.get('instance')
        profile = Profile.objects.create(user=user)
        if not user.username == "gigzag":
            from apps.gigs.models import Gig
            from apps.notifications.utils import create_going_gig_action
            gzag = User.objects.get(username="gigzag")
            profile.friends.add(gzag)
            sgig = Gig.objects.get(pk=1)
            create_going_gig_action(user, sgig)
            send_email.apply_async(('welcome', user.email),)


post_save.connect(create_profile, sender=User)
