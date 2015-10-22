module.exports = function(collection){
	var checkNumPlayers = function(roomNum)
	{
		collection.findOne({"roomNum":roomNum},{}, function(result){
			if (result.players.length == 0)
			{
				collection.remove({'roomNum':roomNum},{}, function(){
					console.log("Room " + roomNum + " removed from db");
				});
			}
		});
	}
	var removePlayer = function(playerID)
	{
		
	}
}
