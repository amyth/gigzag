from django.db import models
from django.utils.text import slugify


class SluggedModel(models.Model):
    """
    A generic model class that implements a auto slug field.
    """

    SLUG_PARENT = 'title'

    slug = models.SlugField(max_length=244)
    title = models.CharField(max_length=100)


    def save(self, *args, **kwargs):
        if hasattr(self, self.SLUG_PARENT):
            value = getattr(self, self.SLUG_PARENT)
            if value:
                self.slug = slugify(value)
        return super(SluggedModel, self).save(*args, **kwargs)
