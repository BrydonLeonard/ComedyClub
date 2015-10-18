var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next){
  res.render('mainMenu', {'title':"Comedy Club"});
});


router.post('/login', function(req, res, next) {
  var roomNum = req.body.roomNum;
  console.log(req.body.roomNum);
  var playerName = req.body.playerName;

  var db = require('../db/dbConfig')();
  var gameCollection = db.get('games');
  gameCollection.findOne({'roomNum':roomNum}, {}, function(err, result){
    if (err){
      console.log("An error ocurred");
      next(err);
    }
    if (result){
      req.session.playerId = String(roomNum)+result.players.length;
      result.players.push({
        'playerId':result.players.length.toString(36),
        'playerName':playerName
      });
      //This may cause problems, not sure if it's being done correctly here
      gameCollection.update({'roomNum':roomNum}, {'$set':result}, function(){
        res.redirect('room/'+req.body.roomNum);//Not sure why roomNum loses its value in the callbacks
      });
    }else{
      getAvailableRoomNumber(gameCollection, getRandomRoomCode(), function(newNum){
        roomNum = newNum;
        console.log(roomNum);
        req.session.playerId = String(roomNum)+'0';
        var newRoom = {
          "roomNum":roomNum,
          'players':[{
            'playerId':0,
            'playerName':playerName
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
  var db = require('../db/dbConfig')();
  var gameCollection = db.get('games');
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


var getRandomRoomCode = function(){
  return (Math.round(Math.random()*10000)).toString(16);
}

var getAvailableRoomNumber = function(gameCollection, roomNum, callback){
  gameCollection.findOne({'roomNum':roomNum}, {}, function(err, result)
  {
    if (result)
      callback(getAvailableRoomNumber(gameCollection, getRandomRoomCode));
    else {
      callback(roomNum);
    }
  });
}


module.exports = router;
