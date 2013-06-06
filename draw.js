
var canvas;
var mode;

function init(){
	canvas = new fabric.Canvas('canvas');
	//Necessary because Fabric.js will default the canvas to 300x150 if no height/width given
	canvas.setWidth(500)
	canvas.setHeight(200);
	canvas.setBackgroundColor("#FFFFFF");

	//Free drawing enabled
	canvas.isDrawingMode = true;
	canvas.freeDrawingLineWidth = 2; //Make this customizable afterwards
	canvas.renderAll();
}

function clearCanvas(){
	canvas.clear();
}

function submit(){
	//Make sure the chat is valid blah blah
	var text = document.getElementById("text-edit").value;
	var log = document.getElementById("chat-log");
	log.insertAdjacentHTML('beforeend','<b>me : </b>' + text + '<br/>');
	log.scrollTop = log.scrollHeight;
}

