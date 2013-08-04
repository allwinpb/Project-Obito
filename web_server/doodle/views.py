from doodle.models import GlobalChatHistory, Room, User, UserChatHistory
from django.http import HttpResponse
from django.shortcuts import render_to_response, render, redirect
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from datetime import datetime
import redis, json, logging

r = redis.StrictRedis(host="localhost",port=6379,db=0)
log = logging.getLogger(__name__)

@csrf_exempt
def ChatHistory(request):
    user_id = request.COOKIES.get('user_id')
    history_list = UserChatHistory.objects.all().filter(user__user_id = user_id).order_by('-end_time')
    return render_to_response('history_list.html', {'history_list': history_list})

@csrf_exempt
def ChatHistoryIndex(request, history_id):
    user_chat_history = UserChatHistory.objects.get(history_id = history_id)
    global_chat_history = GlobalChatHistory.objects.all()
    join = user_chat_history.join_time
    end = user_chat_history.end_time
    room = user_chat_history.room

    user_messages = []
    for message in global_chat_history:
        if message.room == room and message.timestamp < end and message.timestamp > join:
            user_messages.append(message)
    return render(request, 'history_room.html', {'messages': user_messages, 'user': user_chat_history.user})

@csrf_exempt
def AddUser(request):
    # Assuming that request is always POST
    (obj, created) = User.objects.get_or_create(user_id=request.POST['id'], name=request.POST['name'], join_date=timezone.now(), last_visited=timezone.now())
    return HttpResponse(status=204)

@csrf_exempt
def UserChatCreator(request):
    user_key = User.objects.get(user_id=request.POST['user'])
    room_key = Room.objects.get(room_id=base62_decode(str(request.POST['id'])))
    (obj, created) = UserChatHistory.objects.get_or_create(user=user_key, room=room_key, join_time=request.POST['join_time'], end_time=request.POST['end_time'])
    return HttpResponse(status=200)

def HomePage(request):
    return render(request, "welcome.html")

def RoomCreator(request):
    # increment nextID
    r.incr('rooms:nextID')
    newID = base62_encode(int(r.get('rooms:nextID')))
    r.sadd('rooms',newID)
    r.set('room:'+newID+':created',timezone.now())
    return redirect('/rooms/'+newID,permanent=False)

def RoomServer(request,room_id):
    return render_to_response('room.html',{'roomID':room_id})

@csrf_exempt
def MessageArchiver(request):
    # Assuming always POST
    roomID = request.POST['id']

    # get all the necessary info before converting to number
    roomTitle = r.get('room:'+roomID+':title')
    createTime = r.get('room:'+roomID+':created')

    log.warning(roomTitle + ':' + str(createTime))
    # convert roomID to number (base 10)

    newRoom = Room.objects.create(
        room_id=base62_decode(str(roomID)),
        title=roomTitle,
        created=createTime,
        expired=timezone.now(),
    )

    for msg in r.lrange('room:'+roomID+':msg',0,-1):
        msg_obj = json.loads(msg)
        # TODO: COMMIT msg_obj to GlobalChatHistory
        GlobalChatHistory.objects.create(
            content=msg_obj['content'],
            msg_type=msg_obj['type'],
            author=msg_obj['sender'],
            room=newRoom,
            timestamp=msg_obj['timestamp'],
        )

    for session in r.smembers('room:'+roomID+':sessions'):
        session_obj = json.loads(session)
        sessionUser = User.objects.get(pk=int(session_obj['user']))
        UserChatHistory.objects.create(
            user = sessionUser,
            room = newRoom,
            join_time = session_obj['join_time'],
            end_time = session_obj['end_time'],
        )

    pipe = r.pipeline()
    pipe.delete('room:'+roomID+':users')
    pipe.delete('room:'+roomID+':title')
    pipe.delete('room:'+roomID+':msg')
    pipe.delete('room:'+roomID+':created')
    pipe.delete('room:'+roomID+':sessions')
    pipe.srem('rooms',roomID)
    pipe.execute()
    return HttpResponse(status=200)

# ==== Stuff which are not views
ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

def base62_encode(num, alphabet=ALPHABET):
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

def base62_decode(string, alphabet=ALPHABET):
    """Decode a Base X encoded string into the number

    Arguments:
    - `string`: The encoded string
    - `alphabet`: The alphabet to use for encoding
    """
    base = len(alphabet)
    strlen = len(string)
    num = 0

    idx = 0
    for char in string:
        power = (strlen - (idx + 1))
        num += alphabet.index(char) * (base ** power)
        idx += 1

    return num