import re

from django.utils.timesince import timesince


def get_human_time(dt):

    x = timesince(dt).encode("utf-8").replace("\xc2\xa0"," ")
    y = x.split(",")[0]

    dig = re.findall("\d+", y)
    alp = re.findall("[a-z]+", y)


    res = dig[0] + " " + alp[0][:1] + " ago"

    return res
