import os
import json
import traceback

from django.contrib.auth.models import AnonymousUser
from django.db.models import Q
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.utils import timezone

from liked.models import Like
from rest_framework import status
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.exceptions import NotFound
from rest_framework.generics import (
    ListAPIView,
    CreateAPIView,
    RetrieveAPIView
)
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    CreateGigSerializer,
    GigSerializer,
    ProfileSettingsSerializer,
    TagSerializer,
    UserSerializer,
    NotificationSerializer,
)
from apps.accounts.models import ProfileSettings
from apps.gigs.models import Gig, GigLocation
from apps.gigs.tasks import create_cover
from apps.home.tasks import send_email
from apps.notifications import utils as notutils
from apps.notifications.tasks import create_going_to_gig_reminder
from apps.notifications.models import UserNotification
from apps.notifications.utils import mark_as_read_for_user
from apps.tags.models import Tag

## Logging
import logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


class GigDetail(RetrieveAPIView):

    queryset = Gig.objects.all()
    serializer_class = GigSerializer
    lookup_field = 'id'


class MyGigs(ListAPIView):

    queryset = Gig.objects.none()
    serializer_class = GigSerializer

    def get_queryset(self):

        queryset = super(MyGigs, self).get_queryset()
        if self.request.user.is_authenticated():
            queryset = Gig.objects.filter(created_by=self.request.user)

        return queryset.order_by('-created')


class CreateGig(APIView):

    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.POST.get('data'))
            location, _ = GigLocation.objects.get_or_create(
                    **data.get('location'))
            gigdata = {
                "location": location,
                "description": data.get("description", ""),
                "title": data.get("title"),
                "band_name": data.get("artist"),
                "gigtime": self.prepare_dt(data.get("date"), data.get("time")),
                "no_of_pax": data.get("no_of_guests", 0),
                "privacy": data.get("privacy"),
                "youtube_link": data.get("youtube_link", ""),
                "created_by": request.user,
                "email": data.get("email"),
                "phone": data.get("mobile"),
                "gig_type": data.get("gig_type", 1)
            }
            tags = data.get("tags")
            cover = request.FILES.get('cover')
            video = request.FILES.get('file')
            if data.get("id"):
                gig = self.update_gig(data.get("id"), gigdata, cover=cover, video=video)
            else:
                gig = self.create_gig(gigdata, cover=cover, video=video)
		if not cover:
	            create_cover.apply_async((gig,))
                profile = request.user.profile_set.first()
                for friend in profile.friends.all():
                    send_email.apply_async(('hosting', friend.email,
                        {'gig': gig, 'friend': request.user}),)

            tags = self.create_tags(tags)
            if tags:
                gig.tags.add(*tags)

            # serializer
            gser = GigSerializer(gig)
            gser.context['request'] = request
            rdata = {"status": "success", "gig": gser.data}
            return Response(rdata, status=status.HTTP_201_CREATED)
        except Exception as err:
            logger.exception(err)
            rdata = {"status": "error", "message": str(err),
                    "trace": traceback.format_exc()}
            return Response(rdata, status=status.HTTP_400_BAD_REQUEST)

    def prepare_dt(self, dt, tm):
        try:
            dobj = timezone.datetime.strptime(dt, "%d/%m/%Y")
            tspl = tm.split(":")
            dobj = dobj.replace(hour=int(tspl[0]), minute=int(tspl[1]))
            return dobj
        except (ValueError, IndexError) as err:
            raise ValueError("Wrong date or time format provided")

    def create_gig(self, data, cover=None, video=None):
        gig = Gig(**data)

        if video:
            gig.video = video

        if cover:
            gig.cover = cover

        gig.save()
        return gig

    def create_tags(self, tags):
        results = []
        if tags:
            for tdata in tags:
                tag, _ = Tag.objects.get_or_create(title=tdata.get('title'))
                results.append(tag)

            return results

    def update_gig(self, pk, data, cover=None, video=None):
        gig = Gig.objects.get(pk=pk)
        for key, val in data.iteritems():
            setattr(gig, key, val)

        if cover:
            gig.cover = cover

        if video:
            gig.video = video

        gig.save()
        return gig


class CurrentUser(APIView):

    def get(self, request, *args, **kwargs):
        results = {}
        user = None
        if self.request.user.is_authenticated:
            u = UserSerializer(self.request.user)
            user = u.data
        results['user'] =  user

        return Response(results)



class WentTo(APIView):

    def get(self, request, *args, **kwargs):
        gigs = request.user.went_to.all()
        return Response([x.id for x in gigs])


class LikeGig(APIView):

    def get(self, request, *args, **kwargs):
        gig_id = kwargs.get('id')
        try:
            gig = Gig.objects.get(pk=gig_id)
            if not bool(gig.likes.filter(user=request.user)):
                like = Like(content_object=gig, user=request.user)
                like.save()
                notutils.create_like_gig_action(request.user, gig)
            return Response()
        except Gig.DoesNotExist:
            raise NotFound(detail="Gig with id %d" % gig_id)


class GoToGig(APIView):

    def get(self, request, *args, **kwargs):
        try:
            _id = kwargs.get('id')
            gig = Gig.objects.get(pk=_id)
            gig.rsvp.add(request.user)
            notutils.create_going_gig_action(request.user, gig)
            create_going_to_gig_reminder.apply_async((request.user, gig),
                    eta=(gig.gigtime + timezone.timedelta(days=-1)))
            create_going_to_gig_reminder.apply_async((request.user, gig),
                    eta=(gig.gigtime + timezone.timedelta(hours=-1)))
            send_email.apply_async(('going', request.user.email,
                {'gig': gig}))
            send_email.apply_async(('going_reminder', request.user.email,
                {'gig': gig}),
                eta=(gig.gigtime + timezone.timedelta(hours=-1)))

            ## send notification to friends
            profile = request.user.profile_set.first()
            going = list(set(list(profile.friends.all())).intersection(list(gig.rsvp.all())))
            if going:
                for friend in going:
                    fprofile = friend.profile_set.first()
                    ofriends = list((set(list(fprofile.friends.all()))).intersection(list(gig.rsvp.all())))
                    send_email.apply_async(('friend_going', friend.email,
                        {'gig': gig, 'friend': request.user,
                            'other': ofriends}))
            message = "Great! you've rsvp'd for this gig."
        except Gig.DoesNotExist:
            message = "Gig with id %d does not exist." % _id
        return Response({'message': message})


class ProfileSettingsView(APIView):

    def get(self, request, *args, **kwargs):

        profile_settings = request.user.settings.first()
        if not profile_settings:
            profile_settings = self.create_profile_settings(request.user)

        serializer = ProfileSettingsSerializer(profile_settings)
        return Response(serializer.data)

    def create_profile_settings(self, user):
        return ProfileSettings.objects.create(user=user)

    def post(self, request, *args, **kwargs):
        profile_settings = request.user.settings.first()
        singlets = ["posted_by", "nearby_switch", "filter_switch",
                "nearby_radius", "city"]

        if "add_tags" in request.data:
            tags = request.data.get("add_tags", [])
            for tag in tags:
                tag = Tag.objects.get(id=tag)
                profile_settings.filters.add(tag)

        if "remove_tags" in request.data:
            tags = request.data.get("remove_tags", [])
            for tag in tags:
                tag = Tag.objects.get(id=tag)
                profile_settings.filters.remove(tag)

        if 'city' in request.data:
            city = request.data.get('city')
            profile_settings.city = city

        for x in singlets:
            if x in request.data:
                setattr(profile_settings, x, request.data.get(x))
                profile_settings.save()


        return Response({"status": "success"})


class TagSuggestions(ListAPIView):

    serializer_class = TagSerializer
    queryset = Tag.objects.all()

    def get_queryset(self):
        queryset = super(TagSuggestions, self).get_queryset()
        if self.request.user.is_authenticated():
            tags = self.request.user.settings.first().filters.all()
            queryset = queryset.exclude(id__in=[x.id for x in tags])
        #return queryset[:5-len(tags)]
        return queryset


class TagsView(APIView):
    serializer_class = TagSerializer
    queryset = Tag.objects.all()

    def get(self, request, *args, **kwargs):
        queryset = []
        query = self.request.GET.get('query')
        if query:
            queryset = Tag.objects.filter(
                    Q(title__istartswith=query) | Q(title__icontains=query)
            )
            queryset = [TagSerializer(x).data for x in queryset]

        return Response(queryset)


class MyNotifications(ListAPIView):

    queryset = UserNotification.objects.none()
    serializer_class = NotificationSerializer

    def get_queryset(self):

        queryset = super(MyNotifications, self).get_queryset()
        if self.request.user.is_authenticated():
            queryset = UserNotification.objects.filter(
                    user=self.request.user).order_by('-created_at')

        return queryset


class MarkAsRead(APIView):

    def get(self, request, *args, **kwargs):
        if request.user.is_authenticated():
            mark_as_read_for_user(request.user)
        return Response({})


mygigs = MyGigs.as_view()
goto = GoToGig.as_view()
wentto = WentTo.as_view()
likegig = LikeGig.as_view()
current_user = CurrentUser.as_view()
create_gig = CreateGig.as_view()
profile_settings = ProfileSettingsView.as_view()
suggested_tags = TagSuggestions.as_view()
my_notifications = MyNotifications.as_view()
mark_as_read = MarkAsRead.as_view()
tags_view = TagsView.as_view()
gig_detail = GigDetail.as_view()
