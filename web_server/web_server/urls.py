from django.conf.urls import patterns, include, url
from doodle.views import ChatHistory, ChatHistoryIndex, AddUser, HomePage, StaticFileServer, RoomCreator, RoomServer, MessageArchiever

urlpatterns = patterns('',
    url(r'^history/list/$', ChatHistory),
    url(r'^history/list/(?P<history_id>\d+)/$', ChatHistoryIndex),
    url(r'^users/add/$', AddUser), #POST
    url(r'^$',HomePage),
    url(r'/static/(?P<file_path>\s+)/$',StaticFileServer),
    url(r'^rooms/new$', RoomCreator),
    url(r'^rooms/(?P<room_id>\s+)/$', RoomServer),
    url(r'^/update$', MessageArchiver), #POST
)
