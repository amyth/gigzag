from django.apps import AppConfig, apps


class GigzagAppConfig(AppConfig):

    name = "core"

    def ready(self):
        from actstream import registry
        registry.register(apps.get_model("auth.User"))
        registry.register(apps.get_model("tags.Tag"))
        registry.register(apps.get_model("gigs.Gig"))
        registry.register(apps.get_model("django_comments.Comment"))
