var app = require('http').createServer();
var io = require('socket.io').listen(app);

var redis = require('redis');
var client = redis.createClient();

var bridge = require('request');

io.sockets.on('connection', function(socket){
	var room = null;
	var name = null;
	var time_join = null;
	var time_end = null;
	var userObj = null;
	socket.on('register',function(data){
		//Check if room exists
		client.sismember("rooms",data.room,function(err,reply){
			if(data.nickname == "SERVER"){
				socket.emit('register_fail');
				return;
			}
			if(reply){
				client.sismember("room:"+data.room+":users",data.nickname,function(err,reply){
					if(reply==1){
						//user already exists. fail this register request
						socket.emit('register_fail');
					}else{
						//init the user, add to room and send confirmation
						client.sadd("room:"+data.room+":users",data.nickname);
						name = data.nickname;
						room = data.room;
						socket.join(room);
						socket.emit('register_pass');
						userObj = data;
						time_join = new Date();

						//set room title if not already exists
						var placeholder_title = name + "'s room";
						client.setnx("room:"+data.room+":title",placeholder_title,function(err,reply){
							client.get("room:"+data.room+":title",function(err,reply){
								//send room title updates to everyone
								socket.emit('room_update',reply);
							});
						});

						//send hi's and server introductions
						var msg = {};
						msg.sender = "SERVER";
						msg.type = "connect";
						msg.content = data.nickname + " joined this room.";
						socket.broadcast.to(data.room).emit('receive_message',msg);
						msg.content = "Welcome to the chatroom, "+name+"! Say Hi!";
						socket.emit('receive_message',msg);

						//send a list of currently active room members to the users
						client.smembers("room:"+data.room+":users",function(err,reply){
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
		msg.timestamp = new Date();
		//attach this message to redis in order to archive it later
		client.rpush("room:"+room+":msg",JSON.stringify(msg));
		socket.broadcast.to(room).emit('receive_message',msg);
	});

	socket.on('room_update',function(name){
		socket.broadcast.to(room).emit('room_update',name);
		client.set('room:'+room+':title',name);
	});

	socket.on('disconnect',function(){
		if(room == null)	return;
		time_end = new Date();
		//TODO: Send user chat history
		if(userObj.usesFB==true){
			bridge.post('http://localhost/update/session',{
				'user':userObj.userObj.id,
				'id':room,
				'join_time': time_join,
				'end_time':time_end
			},function(a,b,c){});
		}
		socket.leave(room);
		client.srem("room:"+room+":users",name);
		client.scard("room:"+room+":users",function(err,reply){
			if(reply==0){
				console.log('Disassembling ROOM('+room+')...');
				//send all the shit to sql for archiving
				//django should delete all the associated room keys
				bridge.post('http://localhost/update',{'id':room},function(error,resp,body){});
			}
		});
		client.smembers("room:"+room+":users",function(err,reply){
			io.sockets.in(room).emit('user_list',reply);
		});
	});
});

app.listen(8888);