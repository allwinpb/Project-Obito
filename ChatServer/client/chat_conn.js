/* Chat Server */
var chat_server = "http://localhost:8888";
var socket = new Object();

function ChatConnection(){
	this.socket = io.connect(chat_server);
}

ChatConnection.prototype.register = function(nickname,room){
	var user = {};
	user.nickname = nickname;
	user.room = room;
	socket.emit('register_anon',user);
}

ChatConnection.prototype.send = function (type,content,callback){
	var msg = {};
	msg.type = type;
	msg.content = text;
	this.socket.emit('chat_message',msg,callback);
}

ChatConnection.prototype.subscribe = function(type,fn){
	this.socket.on(type,fn);
}

ChatConnection.prototype.logout = function(){
	this.socket.disconnect();
}
