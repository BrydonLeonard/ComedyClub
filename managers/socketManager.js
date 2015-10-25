module.exports = function(server){
	var io = require('socket.io')(server);
	io.on('connection', function(socket)
	{
		socket.on('roomConnect', function(data){
			socket.join(data.roomNum);
		});
		socket.on('playerID', function(data){
			var db = require('../db/dbConfig');
			db.update({'players.playerID':data}, {$set:{'players.$':socket.id}});
		});
		socket.on('disconnect', function(data){
			var dbManager = require('../managers/dbmanager')(require('../db/dbConfig')('games'));
			dbManager.removePlayer(data);
			dbManager.checkNumPlayers();
		});
	return io;
}
