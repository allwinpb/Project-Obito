var app = require('http').createServer();
var io = require('socket.io').listen(app);

var redis = require('redis');
var client = redis.createClient();

io.sockets.on('connection', function(socket){
	var room = null;
	var name = null;
	socket.on('register',function(data){
		//This is the registration information for anon chat-rooms
		//socket.set('nickname',data.nickname);
		//socket.set('room',data.room);

		//CHECK IF data.room EXISTS, IF NOT DISCONNECT
		client.sismember("rooms",data.room,function(err,reply){
			if(reply){
				client.sismember("room:"+data.room,data.nickname,function(err,reply){
					if(reply==1){
						//user already exists. fail this register request
						socket.emit('register_fail');
					}else{
						client.sadd("room:"+data.room,data.nickname);
						name = data.nickname;
						room = data.room;
						socket.join(room);
						socket.emit('register_pass');
						var msg = {};
						msg.type = "connect";
						msg.text = data.nickname + " joined this room.";
						io.sockets.in(data.room).emit('server_message',msg);
						console.log(data.nickname + " joined " + data.room + ".");
					}
				});
			}else{
				//if room does not exist, throw user out the window
				//TODO: disconnect (in callback) AFTER sending disconnect message
				socket.disconnect();
			}
		});
	});

	socket.on('chat_message',function(msg){
		msg.sender = name;
		io.sockets.in(room).emit('receive_message',msg);
		console.log(name + " sent a message to " + room + ".");
	});

	socket.on('disconnect',function(){
		if(room == null)	return;
		
		socket.leave(room);
		client.srem("room:"+room,name);
		client.scard("room:"+room,function(err,reply){
			if(reply==0){
				client.del("room:"+room);
				client.srem("rooms",room);
			}
		});
		var msg = {};
		msg.type = "disconnect";
		msg.text = name + " has left this room.";
		io.sockets.in(room).emit('server_message',msg);
		console.log(name + " left " + room + ".");
	});
});

app.listen(8888);
