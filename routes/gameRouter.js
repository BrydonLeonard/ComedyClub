var express = require('express');
var router = express.Router();

var msgTypes = {
	'readiedUp':0,
	'wordSubmission':1
}

var gameStates = {
	'pregame':0,
	'waitingSubmissions':1,
	'renderingSubmissions':2
}

router.get('/:roomNum', function(req, res, next){
	if (req.session.playerId)
		res.render('gameRoom');
	else res.redirect('/');
});

router.get('/:roomNum/config', function(req, res, next){
	findRoom(req.params.roomNum, function(room){
		req.send(room);
	});
});

router.get('/:roomNum/players', function(req, res, next){
	findRoom(req.params.roomNum, function(room){
		req.send(room.players);
	});
});

router.get('/:roomNum/state', function(req, res ,next){
	var gameCollection = require('../db/dbConfig')('games');
	findRoom(req.params.roomNum, function(room){
		req.send(room.game.state);
	});
});

router.post('/:roomNum', function(req, res, next){
	if (!req.body.msgType){
		Console.log('Invalid room POST');
		res.send('-1');
	}else{
		var gameCollection = require('../db/dbConfig')('games');
		if (req.body.msgType == msgTypes.readiedUp)
		{

		}else if (req.body.msgType == msgTypes.wordSubmission)
		{
			if (!req.body.words)
				req.send('-1')
			else{
				gameCollection.update({"roomNum":req.params.roomNum},
					{$push:{"game.noun":req.body.words.noun,
							"game.verb":req.body.words.verb,
							"game.adverb":req.body.words.adverb,
							"game.flavour":req.body.words.flavour},
						$inc:{"game.num":1}},function(err){
						if (err)
							req.send('-2');
						else{
							req.send('0');
							checkGameState();
						}
					});
				}
		}

	}
});

router.get('/:roomNum/numSentences', function(req, res, next){
	var gameCollection = require('../db/dbConfig')('games');
	findRoom(req.params.roomNum, function(room){
		if (room.game.state == gameStates.renderingSubmissions)
			req.send(room.game.maxNum);
		else req.send("-1");
	});
});

router.get('/:roomNum/sentence', function(req, res, next){
	var gameCollection = require('../db/dbConfig')('games');
	findRoom(req.params.roomNum, function(room){
		if (room.game.state == gameStates.renderingSubmissions)
			req.send(room.game.sentences[room.game.num]);
		else req.send("-1");
	});
});

var findRoom = function(roomNum, callback)
{
	var gameCollection = require('../db/dbConfig')('games');
	gameCollection.findOne({'roomNum':roomNum},{},function(err, room){
		if (err){
			console.log("Error while searching for room: " + roomNum + '. \n' + err);
			next(err);
		}else{
			callback(room);
		}
	});
}

var checkGameState = function(){
	var gameCollection = require('../db/dbConfig')('games');
		console.log('checking game state');
}

module.exports = router;
