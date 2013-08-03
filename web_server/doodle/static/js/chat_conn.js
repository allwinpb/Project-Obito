/* Chat Server */
var chat_server = "http://192.241.196.61:8888";
var socket = null;
$(function(){
	socket = io.connect(chat_server);
	console.log("Server connection established");

	socket.on('register_fail',function(){
		showModalWarning("register-fail");
		console.log('< Registration Failed');
	});
	socket.on('room_fail',function(){
		showModalWarning("room-fail");
		console.log('< Expired Room');
	});
	socket.on('receive_message',function(msg){
		logMessage(msg);
	});
	socket.on('register_pass',function(){
		$("#input-usrname").modal("hide");
		console.log('< Registration Successful');
	});
	socket.on('user_list',function(users){
		var str = "";
		for(var i=0;i<users.length;i++){
			str += '<li><i class="icon-user"></i>  ' + users[i] + '</li>';
		}
		$("#user-list-container").html(str);
		console.log('< Received User List');
	});
	socket.on('room_update',function(name){
		roomTitle = name;
		$('#room-title').text(roomTitle);
		console.log('< Received Title Update');
	});

});

function registerUser(){
	var data = new Object();
	data.nickname = userName;
	data.room = roomID;
	socket.emit('register',data);
	console.log('> Attempting Registration');
}

function submitMessage(){
	var msg = getMessageObject();
	socket.emit('chat_message',msg);
	console.log('> Sending message ('+msg.type+')');
	logMessage(msg);
	//add callback here
}

function updateRoom(name){
	socket.emit('room_update',name);
	console.log('> Attempting Title Update');
}