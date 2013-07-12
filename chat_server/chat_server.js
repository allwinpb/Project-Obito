var app = require('http').createServer();
var io = require('socket.io').listen(app);

var redis = require('redis');
var client = redis.createClient();

io.sockets.on('connection', function(socket){
	var room = null;
	var name = null;
	socket.on('register',function(data){
		//Check if room exists
		client.sismember("rooms",data.room,function(err,reply){
			if(data.nickname == "SERVER"){
				socket.emit('register_fail');
				return;
			}
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
						msg.sender = "SERVER";
						msg.type = "connect";
						msg.content = data.nickname + " joined this room.";
						socket.broadcast.to(data.room).emit('receive_message',msg);
						msg.content = "Welcome to the chatroom, "+name+"! Say Hi!";
						socket.emit('receive_message',msg);
						client.smembers("room:"+room,function(err,reply){
							io.sockets.in(room).emit('user_list',reply);
						});
						console.log(data.nickname + " joined " + data.room + ".");
					}
				});
			}else{
				//if room does not exist, throw user out the window
				//TODO: disconnect (in callback) AFTER sending disconnect message
				socket.emit('room_fail');
				socket.disconnect();
			}
		});
	});

	socket.on('chat_message',function(msg){
		msg.sender = name;
		socket.broadcast.to(room).emit('receive_message',msg);
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
		client.smembers("room:"+room,function(err,reply){
			io.sockets.in(room).emit('user_list',reply);
		});
		var msg = {};
		msg.sender = "SERVER";
		msg.type = "disconnect";
		msg.content = name + " has left this room.";
		socket.broadcast.to(room).emit('receive_message',msg);
		msg.content = "You have been disconnected. You may close this window.";
		socket.emit('receive_message',msg);
		socket.emit('disconnect_success');
		console.log(name + " left " + room + ".");
	});
});
app.listen(8888);