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

	router.get('/playerId', function(req, res, next){
		res.send(req.session.playerId);
	});

	router.get('/:roomNum', function(req, res, next){
		try{
				if (req.session.playerId)
					gameManager.findRoom(req.params.roomNum, function(room){
						var inArr = false;
						if (room){
						room.players.forEach(function(player){
							if (player.playerId = req.session.playerId)
								inArr = true;
						});
						if (inArr)
							res.render('gameRoom');
						else
							res.redirect('/');
					}else {
						res.redirect('/');
					}});
				else res.redirect('/');
			}catch(err){
			res.redirect('/');
		}
	});

	router.get('/:roomNum/config', function(req, res, next){
		gameManager.findRoom(req.params.roomNum, function(room){
			if (room)
				res.send(room);
			else res.redirect('/');
		});
	});

	router.get('/:roomNum/players', function(req, res, next){
		gameManager.findRoom(req.params.roomNum, function(room){
			if (room)
				res.send({players:room.players});
			else res.redirect('/');
		});
	});

	router.get('/:roomNum/state', function(req, res ,next){
		var gameCollection = require('../db/dbConfig')('games');
		gameManager.findRoom(req.params.roomNum, function(room){
			if (room)
				res.send(room.game.state);
			else res.redirect('/');
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
						res.send(responseTypes.ok);
					});
				}else if (req.body.data.msgType == msgTypes.wordSubmission)
				{
					if (req.body.data.words == null)
						res.send(responseTypes.invalid)
					else{
						gameManager.submitWords(req.params.roomNum, req.body.data.words, req.body.data.playerId, function(responseMessage){
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
