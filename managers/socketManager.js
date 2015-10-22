module.exports = function(server){
	var io = require('socket.io')(server);
	io.on('connection', function(socket)
	{
		//console.log('Player connected');
		socket.on('disconnect', function(playerData){
			console.log('Player disconnected');
		});
	});
	return io;
}
