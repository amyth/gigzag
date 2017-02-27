from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.db.models import Q
from django.utils import timezone

from django_comments.models import Comment
from rest_framework import exceptions, viewsets
from rest_framework.response import Response

from apps.accounts.models import Artist
from apps.gigs.models import Gig
from apps.notifications.utils import create_comment_gig_action
from apps.tags.models import Tag
from .serializers import (
    CommentSerializer,
    GigSerializer,
    UserSerializer
)


class GigViewSet(viewsets.ModelViewSet):

    #queryset = Gig.objects.filter(gigtime__gte=timezone.now())
    queryset = Gig.objects.filter(moderated=True)
    serializer_class = GigSerializer
    permission_classes = []

    def get_queryset(self):
        queryset = super(GigViewSet, self).get_queryset()
        df = self.request.GET.get('df')
        dt = self.request.GET.get('dt')
        tag = self.request.GET.get('tag')
        _gid = self.request.GET.get('_gid')
        gig = None

        if _gid:
            queryset = queryset.exclude(pk=_gid)
            gig = Gig.objects.filter(pk=_gid).first()

        ## Filter for today
        if df == 'today':
            today = timezone.now()
            today_start = today.replace(hour=0, minute=0, second=0)
            today_end = today.replace(hour=23, minute=59, second=59)
            queryset = queryset.filter(gigtime__gte=today_start,
                    gigtime__lte=today_end)

        ## Filter for weekend
        if df == 'weekend':
            queryset = queryset.filter(gigtime__week_day__in=[1,6,7])

        if dt:
            gigdate = timezone.datetime.strptime(dt, '%d%m%Y')
            dt_start = gigdate.replace(hour=0, minute=0, second=0)
            dt_end = gigdate.replace(hour=23, minute=59, second=59)
            queryset = queryset.filter(gigtime__gte=dt_start,
                    gigtime__lte=dt_end)

        if tag:
            tags = Tag.objects.filter(title__icontains=tag)
            artists = Artist.objects.filter(title__icontains=tag)
            queryset = queryset.filter(Q(tags__in=tags) | Q(title__icontains=tag
                ) | Q(artists__in=artists) | Q(band_name__icontains=tag))

        if self.request.user.is_authenticated():
            settings = self.request.user.settings.first()
            if settings and settings.nearby_switch:
                queryset = queryset.filter(location__city=settings.city)
        queryset = queryset.distinct().order_by('-gigtime')

        if gig:
            qs_list =  list(queryset)
            qs_list.insert(0, gig)
            return qs_list

        return queryset


class CommentViewSet(viewsets.ModelViewSet):

    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = []

    def get_queryset(self):

        queryset = super(CommentViewSet, self).get_queryset()
        ctype = ContentType.objects.get_for_model(Gig)
        queryset = queryset.filter(content_type_id=ctype.id)

        gigid = self.request.GET.get('gigid')

        if gigid:
            queryset = queryset.filter(object_pk=gigid)


        return queryset.distinct().order_by('-submit_date')

    def create(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            request.data['content_type_id'] = ContentType.objects.get_for_model(Gig).id
            request.data['user'] = request.user
            request.data['site_id'] = settings.SITE_ID
            comment = Comment.objects.create(**request.data)
            ## send notification for comment
            create_comment_gig_action(request.user, comment.content_object)
            return Response(CommentSerializer(comment).data)

        raise exceptions.PermissionDenied(
                detail="You need to be logged in to post a comment")
