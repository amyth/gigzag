from django.contrib.auth import logout
from django.shortcuts import redirect
from django.views.generic.base import TemplateView

from apps.gigs.models import Gig


class Index(TemplateView):

    template_name = 'home/index.html'

    def get(self, request, *args, **kwargs):
        #if not request.session.get('splash', False):
        #    request.session['splash'] = True
        #    return redirect('/splash/')
        return super(Index, self).get(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super(Index, self).get_context_data(**kwargs)
        gig_id = kwargs.get('id')
        if gig_id:
            context['gig_detail'] = Gig.objects.filter(pk=gig_id).first()
        return context

class WebView(TemplateView):
    template_name = 'home/web.html'


class LoginView(TemplateView):

    template_name = 'home/login.html'

class SplashView(TemplateView):

    template_name = 'home/splash.html'


def logout_view(request):
    logout(request)
    return redirect('/')



index = Index.as_view()
loginview = LoginView.as_view()
splash = SplashView.as_view()
webview = WebView.as_view()
