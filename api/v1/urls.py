from django.conf.urls import url, include

from rest_framework import routers

from .views import (
    mygigs,
    goto,
    wentto,
    likegig,
    current_user,
    create_gig,
    profile_settings,
    suggested_tags,
    my_notifications,
    mark_as_read,
    tags_view,
    gig_detail
)
from .viewsets import (
    CommentViewSet,
    GigViewSet
)


router = routers.DefaultRouter()
router.register(r'gigs', GigViewSet)
router.register(r'comments', CommentViewSet)


urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'^cu/$', current_user, name="currentuser"),
    url(r'^mygigs/$', mygigs, name="mygigs"),
    url(r'^goto/(?P<id>\d+)/$', goto, name="gotogig"),
    url(r'^wentto/$', wentto, name="wentto"),
    url(r'^like/gig/(?P<id>\d+)/$', likegig, name="likegig"),
    url(r'^create/$', create_gig, name="creategig"),
    url(r'^settings/$', profile_settings, name="settings"),
    url(r'^suggested/$', suggested_tags, name="suggested"),
    url(r'^notifications/$', my_notifications, name="notifications"),
    url(r'^mark/$', mark_as_read, name="mark"),
    url(r'^tags/$', tags_view, name="tags"),
    url(r'^gig/(?P<id>\d+)/$', gig_detail, name="gig_detail"),
]
