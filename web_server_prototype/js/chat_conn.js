/* Chat Server */
var chat_server = "http://192.241.196.61:8888";
var socket = null;

$(function(){
	socket = io.connect(chat_server);
	console.log("Server connection established");

	socket.on('register_fail',function(){
		showModalWarning("register-fail");
	});
	socket.on('room_fail',function(){
		showModalWarning("room-fail");
	});
	socket.on('receive_message',function(msg){
		logMessage(msg);
	});
	socket.on('register_pass',function(){
		$("#input-usrname").modal("hide");
	});
	socket.on('user_list',function(users){
		var str = "";
		for(var i=0;i<users.length;i++){
			str += '<li><i class="icon-user"></i>  ' + users[i] + '</li>';
		}
		$("#user-list-container").html(str);
	})

});

function registerUser(){
	var nickname = document.getElementById('nickname').value;
	var data = new Object();
	data.nickname = nickname;
	data.room = roomID;
	socket.emit('register',data);
}

function submitMessage(){
	var msg = getMessageObject();
	socket.emit('chat_message',msg);
	logMessage(msg);
	//add callback here
}