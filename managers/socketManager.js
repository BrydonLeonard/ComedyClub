module.exports = function(server){
	var io = require('socket.io')(server);
	io.on('connection', function(socket)
	{
		socket.on('roomConnect', function(data){
			socket.join(data.roomNum);
		});
		socket.on('disconnect', function(data){
			console.log('Player disconnected');
		});
	});
	return io;
}
