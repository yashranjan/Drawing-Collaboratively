let io = require('socket.io').listen(8080);
console.log('SOCKETIO SERVER STARTED ON PORT 8080');
io.sockets.on('connection', function (socket) {
	var id = socket.id;
	socket.on('mousemove', function (data) {
		data.id = id;
		socket.broadcast.emit('moving', data);
	});
	socket.on('disconnect', function () {
		socket.broadcast.emit('clientdisconnect', id);
	});
});
