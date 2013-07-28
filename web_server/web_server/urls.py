from django.conf.urls import patterns, include, url
from doodle.views import ChatHistory, ChatHistoryIndex

urlpatterns = patterns('',
    url(r'^history/list/$', ChatHistory),
    url(r'^history/list/(?P<history_id>\d+)/$', ChatHistoryIndex),
)
