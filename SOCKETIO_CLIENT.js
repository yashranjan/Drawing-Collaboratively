var socket = io.connect('localhost:8080');
var prev = {};
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var pointerContainer = document.getElementById('pointers');
var pointer = document.createElement('div');
pointer.setAttribute('class', 'pointer');
var drawing = false;
var clients = {};
var pointers = {};
var drawLine = function (fromx, fromy, tox, toy) {
	context.moveTo(fromx, fromy);
	context.lineTo(tox, toy);
	context.stroke();
};
var lastEmit = 0;
canvas.onmouseup = canvas.onmousemove = canvas.onmousedown = function (e) {
	switch (e.type) {
		case 'mouseup':
			drawing = false;
			break;
		case 'mousemove':
			if (Date.now() - lastEmit > 50) {
				socket.emit('mousemove', {
					x: e.pageX,
					y: e.pageY,
					drawing: drawing,
				});
				lastEmit = Date.now();
			}
			if (drawing) {
				drawLine(prev.x, prev.y, e.pageX, e.pageY);
				prev.x = e.pageX;
				prev.y = e.pageY;
			}
			break;
		case 'mousedown':
			drawing = true;
			prev.x = e.pageX;
			prev.y = e.pageY;
			break;
		default:
			break;
	}
};
socket.on('moving', function (data) {
	if (!clients.hasOwnProperty(data.id)) {
		pointers[data.id] = pointerContainer.appendChild(pointer.cloneNode());
	}
	pointers[data.id].style.left = data.x + 'px';
	pointers[data.id].style.top = data.y + 'px';
	if (data.drawing && clients[data.id]) {
		drawLine(clients[data.id].x, clients[data.id].y, data.x, data.y);
	}
	clients[data.id] = data;
	clients[data.id].updated = Date.now();
});
socket.on('clientdisconnect', function (id) {
	delete clients[id];
	if (pointers[id]) {
		pointers[id].parentNode.removeChild(pointers[id]);
	}
});
