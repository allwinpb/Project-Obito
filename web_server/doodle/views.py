from doodle.models import GlobalChatHistory, Room, User, UserChatHistory
from django.http import HttpResponse
from django.shortcuts import render_to_response, render
from django.views.decorators.csrf import csrf_exempt
import datetime, urlparse

def ChatHistory(request, user_id):
    history_list = UserChatHistory.objects.all().get(user = user_id).order_by('-end_time')
    return render_to_response('history_list.html', {'history_list': history_list})

def ChatHistoryIndex(request, history_id):
    chat_messages = GlobalChatHistory.objects.get(room = history_id)
    user_chat_history = UserChatHistory.objects.get(id = history_id)
    join = user_chat_history.join_time
    end = user_chat_history.end_time
    user_messages = []
    for message in chat_messages:
        if message.timestamp < end and message.timestamp > join:
            user_messages.append(message)
    return render(request, 'history_room.html') #I don't know the name of variable tag you use in html yet

def AddUser(request):
    # Assuming that request is always POST
    (obj, created) = User.objects.get_or_create(user_id=request.POST['id'], name=request.POST['name'], join_date=datetime.datetime.now(), last_visited=datetime.datetime.now())
    return HttpResponse(status=204)

def HomePage(request):
    return render(request, "welcome.html")

def RoomCreator(request, room_key):
    # Check if room is valid
    if room_key == "new":
        newID = base10_encode(r.scard('rooms')+1000)
        r.sadd('rooms',newID);
        return redirect(newID,permanent=False)
    elif room_key in r.smembers('rooms'):
        return render(request, 'room.html',{'roomID':room_key})
    else:
        return HttpResponse('<html><body><h2>505: NO SUCH ROOM</h2></body></html>')

def RoomServer(request,room_id):
    return render_to_response('room.html',{'roomID':room_id})

def MessageArchiver(request):
    return HttpResponse(status=200)
# ==== Stuff which are not views
ALPHABET = "0123456789"

def base10_encode(num, alphabet=ALPHABET):
    """Encode a number in Base X

    `num`: The number to encode
    `alphabet`: The alphabet to use for encoding
    """
    if (num == 0):
        return alphabet[0]
    arr = []
    base = len(alphabet)
    while num:
        rem = num % base
        num = num // base
        arr.append(alphabet[rem])
    arr.reverse()
    return ''.join(arr)