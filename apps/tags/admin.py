from django.contrib import admin

from .models import Tag


class TagAdmin(admin.ModelAdmin):
    fields = ('title', )

admin.site.register(Tag, TagAdmin)
