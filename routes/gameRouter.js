var express = require('express');
var router = express.Router();
module.exports = function(){
	var gameManager = require('../managers/gameManager')();

	var msgTypes = {
		'startGame':0,
		'wordSubmission':1
	}

	var responseTypes = {
		'error':'-1',
		'invalid':'-2',
		'ok':'0'
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
		gameManager.findRoom(req.params.roomNum, function(room){
			req.send(room);
		});
	});

	router.get('/:roomNum/players', function(req, res, next){
		gameManager.findRoom(req.params.roomNum, function(room){
			req.send(room.players);
		});
	});

	router.get('/:roomNum/state', function(req, res ,next){
		var gameCollection = require('../db/dbConfig')('games');
		gameManager.findRoom(req.params.roomNum, function(room){
			req.send(room.game.state);
		});
	});

	router.post('/:roomNum', function(req, res, next){
		try{
			if (req.body.data.msgType == null){
				console.log('Invalid room POST');
				res.send('-1');
			}else{
				var gameCollection = require('../db/dbConfig')('games');
				if (req.body.data.msgType == msgTypes.startGame)
				{
					gameManager.gameStart(req.params.roomNum, function(){
						res.send('0');
					});
				}else if (req.body.data.msgType == msgTypes.wordSubmission)
				{
					if (req.body.data.words == null)
						res.send(responseTypes.invalid)
					else{
						gameManager.submitWords(req.params.roomNum, req.body.data.words, function(responseMessage){
							res.send(responseMessage);
						});
					}
				}
			}
		}catch(err){
			res.send(responseTypes.error);
			console.log(err);
		}
	});

	router.get('/:roomNum/numSentences', function(req, res, next){
		var gameCollection = require('../db/dbConfig')('games');
		gameManager.findRoom(req.params.roomNum, function(room){
			if (room.game.state == gameStates.renderingSubmissions)
				req.send(room.game.maxNum);
			else req.send("-1");
		});
	});

	router.get('/:roomNum/sentence', function(req, res, next){
		var gameCollection = require('../db/dbConfig')('games');
		gameManager.findRoom(req.params.roomNum, function(room){
			if (room.game.state == gameStates.renderingSubmissions)
				req.send(room.game.sentences[room.game.num]);
			else req.send("-1");
		});
	});
	return router;
}
