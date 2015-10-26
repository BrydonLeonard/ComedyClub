var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next){
  res.render('mainMenu', {'title':"Comedy Club"});
});

module.exports = function(){
	router.post('/login', function(req, res, next) {
	  var roomNum = req.body.roomNum;
	  var playerName = req.body.playerName;

	  var gameCollection = require('../db/dbConfig')('games');
	  gameCollection.findOne({'roomNum':roomNum}, {}, function(err, result){
	    if (err){
	      console.log("An error ocurred");
	      next(err);
	    }
	    if (result){
      var playerID = String(roomNum)+result.players.length.toString(36)
	      req.session.playerId = playerID;
				var newPlayer = {
	        'playerId': playerID,
	        'playerName':playerName,
	      }
	      result.players.push(newPlayer);
	      //This may cause problems, not sure if it's being done correctly here
	      gameCollection.update({'roomNum':roomNum}, {'$push':{'players':newPlayer}}, function(err){
					if (err){
						console.log(err)
						res.redirect('/');
					}else{
						broadcastNewPlayer(roomNum, playerName);
		        res.redirect('room/'+roomNum);
					}
	      });
	    }else{
	      getAvailableRoomNumber(gameCollection, getRandomRoomCode(), function(newNum){
	        roomNum = newNum;
	        req.session.playerId = String(roomNum)+'0';
					console.log('Room created ' + roomNum);
	        var newRoom = {
	          "roomNum":roomNum,
	          'players':[{
	            'playerId':req.session.playerId,
	            'playerName':playerName,
	          }]
	        }
	        gameCollection.insert(newRoom, function(err){
	          if (err){
	            console.log("Error occurred");
	            next(err);
	          }
	          res.redirect('room/'+roomNum);
	        });
	      });
	    }
	  })
	});

	router.post('/make', function(req, res, next){
	  var gameCollection = require('../db/dbConfig')('games');
	  var exists = true;
	  var roomNum = 0;
	  while (!exists){
	    exists = false;
	    roomNum = makeRoomNum();
	    gameCollection.find({'roomNum':roomNum},{}, function(){
	      exists = true;
	    })
	  }
	  var room = {

	  }
	});

	var broadcastNewPlayer = function(roomNum, playerName)
	{
		io.sockets.in(roomNum).emit('newPlayer', {playerName:playerName});
	}


	var getRandomRoomCode = function(){
	  return (Math.round(Math.random()*10000)).toString(16);
	}

	var getAvailableRoomNumber = function(gameCollection, roomNum, callback){
	  gameCollection.findOne({'roomNum':roomNum}, {}, function(err, result)
	  {
	    if (result){
				try{
	      	callback(getAvailableRoomNumber(gameCollection, getRandomRoomCode));}
				catch(err){
					console.log(err);}
			}
	    else {
	      callback(roomNum);
	    }
	  });
	}
	return router;
}
