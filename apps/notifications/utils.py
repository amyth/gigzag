from actstream import action

from .models import UserNotification


def create_like_gig_action(actor, gig, important=False):

    verb = "likes"
    actlist = action.send(actor, verb=verb, target=gig)
    _action = actlist[-1][-1]

    notification = UserNotification.objects.create(action=_action,
            user=gig.created_by, important=important)

    ## create friend notifications
    for friend in actor.profile_set.first().friends.all():
        UserNotification.objects.create(action=_action,
                user=friend, important=important)

    return notification

def create_comment_gig_action(actor, gig, important=False):

    verb = "commented on"
    actlist = action.send(actor, verb=verb, target=gig)
    _action = actlist[-1][-1]

    notification = UserNotification.objects.create(action=_action,
            user=gig.created_by, important=important)

    return notification

def create_going_gig_action(actor, gig, important=False):

    verb = "is going to"
    actlist = action.send(actor, verb=verb, target=gig)
    _action = actlist[-1][-1]

    notification = UserNotification.objects.create(action=_action,
            user=gig.created_by, important=important)

    ## create friend notifications
    for friend in actor.profile_set.first().friends.all():
        UserNotification.objects.create(action=_action,
                user=friend, important=important)

    ## self notifications
    UserNotification.objects.create(action=_action, user=actor,
            important=important)

    return notification

def create_gig_going_reminder(actor, gig, important=False):
    verb = "You have a gig to go to. "
    actlist = action.send(actor, verb=verb, target=gig)
    _action = actlist[-1][-1]

    notification = UserNotification.objects.create(action=_action,
            user=actor, important=important)

def get_user_notification_count(user):

    return UserNotification.objects.filter(user=user, unread=True).count()


def mark_as_read_for_user(user):
    for notification in UserNotification.objects.filter(user=user, unread=True):
        notification.unread = False
        notification.save()
