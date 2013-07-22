// BLACK MAGIC IN PROGRESS. DO NOT TOUCH THIS CODE.

//Canvas in user editing area
var eCanvas = null;

//variable used for denoting the type of message
var message_type = "text";

//init function
$(function(){
	//initialise the doodle editor
	eCanvas = new fabric.Canvas("canvas");

	//show tooltips
	$('.tooltip-container').tooltip({
		animation: false
	});
	$('#doodle-color-select').popover();
	console.log('popover done');
	$("#input-usrname").modal("show");
});

$('a[data-toggle="tab"]').on('shown',function(e){
	if(e.target.id=="doodle-tab"){
		prepareCanvasInput();
		message_type = "drawing";
	}else{
		message_type = "text";
	}
});

//Prepares the canvas area for free-drawing
function prepareCanvasInput(){
	var height = $("canvas").parent().parent().height();
	var width = $("canvas").parent().parent().width();
	console.log(height + ":" + width);
	if(eCanvas==null){
		eCanvas = new fabric.Canvas("canvas");	
	}
	eCanvas.clear();
	eCanvas.setWidth(width);
	eCanvas.setHeight(height);
	eCanvas.setBackgroundColor("#FFFFFF");
	eCanvas.isDrawingMode = true;
	eCanvas.freeDrawingLineWidth = 2;
	eCanvas.renderAll();
}


//Prepares a static canvas and load it with the
//incoming drawing
function prepareCanvasOutput(id,msg){
	var outputCanvas = new fabric.StaticCanvas(id);
	outputCanvas.setWidth(msg.width);
	outputCanvas.setHeight(msg.height);
	console.log('Canvas drawn on ' + id +': '+msg.content);
	outputCanvas.loadFromJSON(msg.content);
	outputCanvas.renderAll();
}

function showModalWarning(warning){
	var title,content;
	if(warning=="register-fail"){
		title = "Doppleganger detected!";
		content = "Uh oh! It seems somebody already use that name. Why don't you pick another one?";
	}else if(warning=="room-fail"){
		title="No room!";
		content = "We regret to inform you that the room you requested to join does not exist (or expired). You may close this window.";
	}

	$("#warning-box").append(
		'<div class="alert">' +
		'<button type="button" class="close" data-dismiss="alert">&times;</button>' +
		'<i class="icon-warning-sign"></i>' +
		'<strong> ' + title + '</strong><br>' + content +
		'</div>');
}


function logMessage(msg){
	var msgClass;
	var header;
	if(msg.sender == "SERVER"){
		$(".chat-log").append(
			'<li class="chat-server">-- '+msg.content+' --</li><br>');
		return;
	}else if(msg.sender == undefined){
		msgClass = "chat-user chat-msg";
		header = "You :";
	}else{
		msgClass = "chat-other chat-msg";
		header = msg.sender + " :";
	}
	header = '<small>'+header+'</small>';
	if(msg.type == "text"){
		$(".chat-log").append(
		'<li class="'+msgClass+'">'+
		header+
		'<p>'+msg.content+'</p></li><br>');
	}else if(msg.type == "drawing"){
		var id=$(".chat-log").children().length;
		id = id ? id : 0;	//if id undefined id = 0
		$(".chat-log").append(
			'<li class="'+msgClass+'">'+header+
			'<canvas id="doodle'+id+'"></canvas>'+
			'</li>');
		setTimeout(function(){
			prepareCanvasOutput('doodle'+id,msg);
		},200);
		
	}
}

function getMessageObject(){
	var msg = new Object();
	msg.type = message_type;
	if(message_type=="text"){
		msg.content = $("#text-editor").val();
	}else if(message_type=="drawing"){
		msg.content = JSON.stringify(eCanvas);
		msg.height = eCanvas.getHeight();
		msg.width = eCanvas.getWidth();
		eCanvas.clear();
		eCanvas.renderAll();
	}
	return msg;
}