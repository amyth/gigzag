from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType

from actstream.models import Action
from django_comments.models import Comment
from rest_framework import serializers

from apps.accounts.models import ProfileSettings
from apps.gigs.models import Gig
from apps.notifications import utils as notils
from apps.notifications.models import UserNotification
from apps.tags.models import Tag
from utils import get_human_time


class UserSerializer(serializers.ModelSerializer):

    profile_image = serializers.SerializerMethodField()
    notification_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'profile_image',
                'notification_count')

    def get_profile_image(self, obj):
        return obj.profile_set.first().profile_picture

    def get_notification_count(self, obj):
        return notils.get_user_notification_count(obj)

class CreateGigSerializer(serializers.Serializer):
    date = serializers.DateField()
    time = serializers.TimeField()


class CommentSerializer(serializers.ModelSerializer):

    user = UserSerializer(read_only=True)
    posted_at = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Comment
        depth = 1
        fields = ('comment', 'object_pk', 'user', 'posted_at')

    def get_posted_at(self, obj):
        return get_human_time(obj.submit_date)


class GigSerializer(serializers.ModelSerializer):

    like_count = serializers.SerializerMethodField(read_only=True)
    comment_count = serializers.SerializerMethodField(read_only=True)
    gig_address = serializers.SerializerMethodField(read_only=True)
    date = serializers.SerializerMethodField(read_only=True)
    date_slash = serializers.SerializerMethodField(read_only=True)
    timings = serializers.SerializerMethodField(read_only=True)
    has_liked = serializers.SerializerMethodField(read_only=True)
    is_active = serializers.SerializerMethodField(read_only=True)
    rsvp = UserSerializer(many=True, read_only=True)
    created_by = UserSerializer(read_only=True)
    cover = serializers.SerializerMethodField(read_only=True)
    band_name = serializers.CharField(required=False)
    description = serializers.CharField(required=False)

    class Meta:
        model = Gig
        fields = ('id', 'title', 'gigtime', 'gig_address',
                  'cover', 'video', 'like_count', 'timings',
                  'comment_count', 'rsvp', 'tags', 'date',
                  'has_liked', 'is_active', 'status', 'youtube_link',
                  'band_name', 'no_of_pax', 'phone', 'email', 'description',
                  'privacy', 'location', 'date_slash', 'created_by',
                  'moderated', 'gig_type')
        depth = 1

    def get_like_count(self, obj):
        return obj.likes.all().count()

    def get_comment_count(self, obj):
        comms = ContentType.objects.get_for_model(obj)
        comments = Comment.objects.filter(content_type_id=comms.id,
                object_pk=obj.id).count()

        return comments

    def get_cover(self, obj):
        if obj.cover:
            return "http://gigzag.in%s" % obj.cover.url
        if obj.youtube_link:
            video_id = obj.youtube_link.split("/")[-1]
            return "http://img.youtube.com/vi/{}/0.jpg".format(video_id)

    def get_gig_address(self, obj):
        gtype = obj.get_gig_type_display()
        loc = obj.location.address
        city = obj.location.get_city_display()
        return "%s: %s, %s" % (gtype, loc, city)

    def get_date(self, obj):
        return obj.gigtime.date().strftime('%d %b %Y (%A)')

    def get_date_slash(self, obj):
        return obj.gigtime.date().strftime('%d/%m/%Y')

    def get_timings(self, obj):
        return obj.gigtime.strftime('%I:%M %p')

    def get_has_liked(self, obj):
        request = self.context['request']
        if request.user.is_authenticated():
            return bool(obj.likes.filter(user=request.user))
        return False

    def get_is_active(self, obj):
        return bool(obj.status)


class ProfileSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfileSettings
        fields = ('filter_switch', 'nearby_switch', 'filters', 'posted_by',
                'nearby_radius', 'city')
        depth = 1


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ('title', 'id')
        depth = 1

class ActionSerializer(serializers.ModelSerializer):

    actor = UserSerializer()
    target_name = serializers.SerializerMethodField()
    target_date = serializers.SerializerMethodField()
    target_id = serializers.SerializerMethodField()

    class Meta:
        model = Action
        fields = ('actor', 'verb', 'target_name', 'target_date', 'target_id')
        depth = 1

    def get_actor_name(self, obj):
        return obj.actor.first_name

    def get_target_name(self, obj):
        return obj.target.title

    def get_target_id(self, obj):
        return obj.target.id

    def get_target_date(self, obj):
        return obj.target.gigtime.date().strftime('%d %b %Y (%A)')


class NotificationSerializer(serializers.ModelSerializer):

    action = ActionSerializer()
    timesince = serializers.SerializerMethodField()

    class Meta:
        model = UserNotification
        fields = ('action', 'unread', 'important', 'timesince')
        depth = 1

    def get_timesince(self, obj):
        return get_human_time(obj.created_at)
