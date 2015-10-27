module.exports = function(collection){
	var dbManager = {};
	dbManager.checkNumPlayers = function(roomNum)
	{
		collection.findOne({"roomNum":roomNum},{}, function(err, result){
			if (result){
				if (result.players.length == 0)
				{
					collection.remove({'roomNum':roomNum},{}, function(){
						console.log("Room " + roomNum + " closed");
					});
				}
			}
		});
	}
	dbManager.removePlayer = function(socketId, callback)
	{
		collection.findOne({'players':{$elemMatch:{'socketId':socketId}}} ,{} , function(err, result){
			if (result){
				var players = result.players;
				var num = 0;
				for (var i = 0; i < players.length; i++)
				{
					if (players[i].socketId == socketId)
					num = i;
					break;
				}
				collection.update({"_id":result._id}, {'$pull':{'players':{'socketId':socketId}}},function(err){
					console.log('Room ' + result.roomNum + ' removed player with socket ' + socketId);
					callback(result.roomNum, num);
				});
			}
		});
	}
	return dbManager;
}
