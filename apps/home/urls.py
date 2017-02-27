from django.conf.urls import url


from .views import (
    index,
    loginview,
    logout_view,
    splash,
    webview,
)


urlpatterns = [
    url(r'^$', index, name="index"),
    url(r'^gig/(?P<id>[\d]+)/$', index, name="index"),
    url(r'^splash/$', splash, name="splash"),
    url(r'^login/$', loginview, name="login"),
    url(r'^logout/$', logout_view, name="logout"),
    url(r'^web/$', webview, name="webview"),
]
