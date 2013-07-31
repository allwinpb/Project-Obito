from doodle.models import GlobalChatHistory, Room, User, UserChatHistory
from django.http import HttpResponse
from django.shortcuts import render_to_response, render
import datetime, urlparse

def ChatHistory(request):
    return render(request, "history_list.html", {'history_list': UserChatHistory.objects.all()})

def ChatHistoryIndex(request, history_id):
    return render_to_response("history_room.html", {'history': UserChatHistory.objects.get(id=history_id)})

def AddUser(request):
    url = request.get_full_path()
    par = urlparse.parse_qs(urlparse.urlparse(url).query)
    User(id = par['id'], user = par['user'], join_date=datetime.datetime.now()).save()
    return render(request, 'adduser.html')

def HomePage(request):
    return render(request, "welcome.html")

