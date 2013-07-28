from doodle.models import GlobalChatHistory, Room, User, UserChatHistory
from django.http import HttpResponse
from django.shortcuts import render_to_response

def ChatHistory(request):
    return render_to_response("chathistory.html", {'history_list': UserChatHistory.objects.all()})

def ChatHistoryIndex(request, history_id):
    return render_to_response("chatindex.html", {'history': UserChatHistory.objects.get(id=history_id)})
