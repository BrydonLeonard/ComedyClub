module.exports = function(collection){
	var dbManager = {};
	dbManager.checkNumPlayers = function(roomNum)
	{
		collection.findOne({"roomNum":roomNum},{}, function(result){
			if (result.players.length == 0)
			{
				collection.remove({'roomNum':roomNum},{}, function(){
					console.log("Room " + roomNum + " closed");
				});
			}
		});
	}
	dbManager.removePlayer = function(socketID)
	{
		collection.findOne({'player.socketID':socket.id}, {}, function(err, result){
		if (result){
			collection.update({}, {'$pull':{'players':{'socketID':data}}},function(err){
				if (!err)
					console.log('Room ' + result.roomNum + ' removing player ' + result.players.$.playerID);
				}
			}
		});
	}
	return dbManager;
}
