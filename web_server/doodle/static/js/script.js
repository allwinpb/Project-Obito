// BLACK MAGIC IN PROGRESS. DO NOT TOUCH THIS CODE.

//VARIABLES
//roomTitle, roomID

//Canvas in user editing area
var eCanvas = null,
	eCanvasColor = 4, //black
	eCanvasWidth = 2,
	roomTitle = "{{roomTitle}}",
	userName = null;

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

	//init and logic code for the color popover
	prepareColorModal();
	//init and logic code for the thickness popover
	prepareWidthModal();

	//prepare the room title editing code
	$('#room-title').on('blur',function(e){
		if(roomTitle != e.target.innerText){
			//id has been changed
			if(e.target.innerText == ""){
				e.target.innerText = roomTitle;
			}else{
				roomTitle = e.target.innerText;
				updateRoom(roomTitle);
			}
		}
	}).on('keyup',function(e){
		if(e.which==13){
			focusChat();
			//would call the blur event above
		}
	}).on('keydown',function(e){
		if(e.which==13){
			e.preventDefault();
		}
	});

	//submit logic
	$('#btn-submit').on('click',function(){
		submitMessage();
	});
	$('#text-editor').on('keyup',function(e){
		if(e.which==13){
			submitMessage();
		}
	}).on('keydown',function(e){
		if(e.which==13){
			e.preventDefault();
		}
	});

	//show the input name box only when user is not signed in
	(function startLoginProcess(){
		if(userSignedIn==true){
			//connected through fb
			registerUser(); //userName is already assigned
			console.log(userName + ' registered as Facebook User');
		}else if(userSignedIn==false){
			//not connected through fb, so show the anon-input window
			var affirmativeAction = function(){
				userName = $('#nickname').val();
				registerUser();
				console.log(userName + ' registered as Anon User');
			};
			$('#anon-username-input').css('display','block').on('keyup',function(e){
				if(e.which==13){
					affirmativeAction();
				}
			});
			$('#anon-username-submit').css('display','inline-block').on('click',affirmativeAction);
		}else{
			//fb is not done loading, wait for a bit and try again
			setTimeout(startLoginProcess,200);
		}
	})();

	$("#input-usrname").modal("show");
});

$('a[data-toggle="tab"]').on('shown',function(e){
	if(e.target.id=="doodle-tab"){
		prepareCanvasInput();
		message_type = "drawing";
	}else{
		$('#text-editor').val('');
		message_type = "text";
	}
});

//Init and logic code for the color selector
function prepareColorModal(){
	var color_popup_content = " \
	<ul id='color-list' class='inline'> \
	<li><div style='background-color:red'></div></li> \
	<li><div style='background-color:green'></div></li> \
	<li><div style='background-color:blue'></div></li> \
	<li><div style='background-color:yellow'></div></li> \
	<li><div style='background-color:black'></div></li> \
	</ul> \
	";
	$('#doodle-color-select').popover({
		html:true,
		content:color_popup_content,
		trigger:'click focus'
	}).on('shown',function(){
		$('#color-list').children()[eCanvasColor].className += " selected";
		$('#color-list > li > div').on('click',function(e){
			$('#doodle-color-select').html(e.target.outerHTML);
			$('#doodle-color-select > div').text('"');
			$('li.selected').removeClass('selected');
			eCanvas.freeDrawingBrush.color = e.target.style.backgroundColor;
			if(e.target.parentNode.className.indexOf("selected")<0){
				e.target.parentNode.className = "selected";
				var color_list = e.target.parentNode.parentNode.children;
				for(var i=0;i<color_list.length;i++){
					if(e.target.parentNode == color_list[i]){
						eCanvasColor = i;
						break;
					}
				}
			}
		});	
	});
}

function prepareWidthModal(){
	var width_popover_content = " \
	<ul id='width-list' class='inline'> \
	<li>1</li> \
	<li>2</li> \
	<li>3</li> \
	<li>4</li> \
	</ul> \
	";
	$('#doodle-width-select').popover({
		html:true,
		content:width_popover_content,
		trigger:'click focus'
	});

}

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

function CanvasOutput(msg){
	var outputCanvas = new fabric.StaticCanvas();
	outputCanvas.setWidth(msg.width);
	outputCanvas.setHeight(msg.height);
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
	$(".chat-log").animate({ scrollTop: $(".chat-log").scrollHeight}, 1000);
}

function getMessageObject(){
	var msg = new Object();
	msg.type = message_type;
	if(message_type=="text"){
		msg.content = $("#text-editor").val();
		$('#text-editor').val("");
	}else if(message_type=="drawing"){
		msg.content = JSON.stringify(eCanvas);
		msg.height = eCanvas.getHeight();
		msg.width = eCanvas.getWidth();
		eCanvas.clear();
		eCanvas.renderAll();
	}
	return msg;
}

function focusChat(){
	$('#text-editor').focus();
}