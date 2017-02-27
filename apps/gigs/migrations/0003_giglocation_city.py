# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2016-11-10 15:14
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gigs', '0002_auto_20161025_0730'),
    ]

    operations = [
        migrations.AddField(
            model_name='giglocation',
            name='city',
            field=models.CharField(choices=[(b'del', b'Delhi NCR'), (b'gur', b'Gurgaon'), (b'mum', b'Mumbai'), (b'ban', b'Bangalore'), (b'hyd', b'Hyderabad'), (b'kol', b'Kolkata'), (b'pun', b'Pune'), (b'che', b'Chennai')], default='gur', max_length=5),
            preserve_default=False,
        ),
    ]