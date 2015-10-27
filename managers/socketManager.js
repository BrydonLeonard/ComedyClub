module.exports = function(server){
	var io = require('socket.io')(server);
	io.on('connection', function(socket)
	{
		socket.on('roomConnect', function(data){
			socket.join(data.roomNum);
		});
		socket.on('playerId', function(data){
			var db = require('../db/dbConfig')('games');;
			db.update({'players.playerId':data.playerId}, {$set:{'players.$.socketId':socket.id}});
		});
		socket.on('disconnect', function(data){
			var collection = require('../db/dbConfig')('games');
			var dbManager = require('./dbManager')(collection);
			dbManager.removePlayer(socket.id, function(roomNum, playerNum){
				io.sockets.in(roomNum).emit('leavePlayer', {playerNum:playerNum});
				dbManager.checkNumPlayers(roomNum);
			});
		});
	});
	return io;
}
