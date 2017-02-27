from django.contrib import admin

from .models import (
    GigLocation,
    Gig
)


class GigLocationAdmin(admin.ModelAdmin):
    pass


class GigAdmin(admin.ModelAdmin):
    fields = ('title', 'description', 'gigtime', 'gig_type',
            'no_of_pax', 'location', 'tags', 'cover', 'video',
            'youtube_link', 'band_name', 'phone', 'email',
            'privacy', 'status', 'moderated', 'created_by',
            'rsvp')

admin.site.register(GigLocation, GigLocationAdmin)
admin.site.register(Gig, GigAdmin)
