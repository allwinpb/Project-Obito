from doodle.models import GlobalChatHistory, Room, User, UserChatHistory
from django.http import HttpResponse
from django.shortcuts import render_to_response, render, redirect
from django.views.decorators.csrf import csrf_exempt
import datetime, urlparse, redis, json

r = redis.StrictRedis(host="localhost",port=6379,db=0)

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

@csrf_exempt
def AddUser(request):
	# Assuming that request is always POST
	(obj, created) = User.objects.get_or_create(user_id=request.POST['id'], name=request.POST['name'], join_date=datetime.datetime.now(), last_visited=datetime.datetime.now())
	return HttpResponse(status=204)

def HomePage(request):
	return render(request, "welcome.html")

def RoomCreator(request):
	# increment nextID

	newID = base62_encode(r.get('rooms:nextID'))
	r.sadd('rooms',newID);
	r.set('room:'+newID+':created',datetime.datetime.now())
	return redirect('/rooms/'+newID,permanent=False)

def RoomServer(request,room_id):
	return render_to_response('room.html',{'roomID':room_id})

def MessageArchiver(request):
	# Assuming always POST
	roomID = request.POST['id']

	# get all the necessary info before converting to number
	roomTitle = r.get('room:'+roomID+':title')
	createTime = r.get('room:'+roomID+':created')

	# convert roomID to number (base 10)
	roomID = base62_decode(roomID)

	Room.objects.create(
		room_id=roomID,
		title=roomTitle,
		created=createTime,
		expired=datetime.datetime.now()
	)

	for msg in r.lrange('room:'+roomID+':msg',0,-1):
		msg_obj = json.load(msg)
		# TODO: COMMIT msg_obj to GlobalChatHistory
		GlobalChatHistory.objects.create(
			content=msg_obj['content'],
			msg_type=msg_obj['type'],
			author=msg_obj['sender'],
			room=roomID,
			timestamp=msg_obj['timestamp'],
		)
	pipe = r.pipeline()
	pipe.delete('room:'+roomID+':users')
	pipe.delete('room:'+roomID+':title')
	pipe.delete('room:'+roomID+':msg')
	pipe.srem('rooms',roomID)
	pipe.execute()

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