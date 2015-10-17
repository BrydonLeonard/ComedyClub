var express = require('express');
var router = express.Router();



router.get('/', function(req, res, next){
  res.render('mainMenu', {'title':"Comedy Club"});
});

router.get('/a', function(req, res, next){
  res.render('gameRoom');
})


router.post('/login', function(req, res, next) {
  var roomNum = req.body.roomNum;
  if (!roomNum)
    roomNum = '-';
  var playername = req.body.playername;

  var db = require('../db/dbConfig')();
  var gameCollection = db.get('games');
  var exists = true;
  gameCollection.findOne({'roomNum':roomNum}), {}, function(err, result){
    if (result){
      req.session.playerid = result.players.length;
      result.players.push({
        'id':result.players.length.toString(36),
        'playername':playername
      });
      //This may cause problems, not sure if it's being done correctly here
      gameCollection.update({'roomNum':noomNum}, {'$set':result});
    }else{
      var roomNum = getAvailableRoomNumber(gameCollection, getRandomRoomCode());
      var newRoom = {
        "roomNum":roomNum,
        'players':[{
          'id':0,
          'name':playerName
        }]
      }
    }
  }
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
  return (Math.Round(Math.random()*1000000)).toString(36);
}

var getAvailableRoomNumber = function(gameCollection, roomNum){
  gameCollection.findOne({'roomNum':roomNum}, {}, function(err, result)
  {
    if (result)
      return findRoom(gameCollection, getRandomRoomCode)
    else return roomNum;
  })
}


module.exports = router;
