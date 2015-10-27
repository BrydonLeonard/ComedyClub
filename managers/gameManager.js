var gameManager = {};

module.exports = function(){
	var gameStates = {
		'pregame':0,
		'waitingSubmissions':1,
		'renderingSubmissions':2,
		'pregameNoRender':3
	}
	var responseTypes = {
		'error':'-1',
		'invalid':'-2',
		'ok':'0'
	}
	var wordInArrayPos = {
		'verb':0,
		'noun':1,
		'adverb':2,
		'flavour':3
	}

	gameManager.gameStart = function(roomNum, callback){
		var gameCollection = require('../db/dbConfig.js')('games');
		gameManager.findRoom(roomNum, function(room){
			if (room.game == null || room.game.state == gameStates.pregame || room.game.state == gameStates.pregameNoRender){
					gameCollection.update({"roomNum":roomNum},
				{$set:{
					'game':{'state':gameStates.waitingSubmissions,
									'num':0,
									'maxNum':room.players.length,
									'noun':[],
									'verb':[],
									'adverb':[],
									'flavour':[]
									}
								}
			},function(err){
					if (err){
						console.log('something went wrong');
						console.log(err);
						callback(responseTypes.error);
					}
					else {
						gameManager.triggerStateChange(roomNum, gameStates.waitingSubmissions);
						callback(responseTypes.ok);
					}
				});
			}
		})
	}

	gameManager.gameDisplay = function(roomNum){
		gameManager.generateSentences(roomNum, function(numSentences){
			if (numSentences > 0){
				gameManager.configForDisplay(roomNum, numSentences, function(){	});
					}
			});
	}

	gameManager.nextSentence = function(roomNum){
		gameManager.findRoom(roomNum, function(room){
			if (room){
				if (room.game.num < room.game.maxNum-1){
					var gameCollection = require('../db/dbConfig')('games');
					gameCollection.update({'roomNum':roomNum},{
						$inc:{'game.num':1}
					});
					gameManager.findRoom(roomNum, function(rm){
						gameManager.broadcastSentence(rm);
						setTimeout(gameManager.nextSentence, 1000*15, roomNum);
					});
				}else{
					var gameCollection = require('../db/dbConfig')('games');
					gameCollection.update({'roomNum':roomNum}, {$set:{
						'game.state':gameStates.pregame,
						'game.num':1,
						'game.maxNum':0
					}},function(){
							gameManager.triggerStateChange(roomNum, gameStates.pregame);
					});
				}
			}
		});
	}

	gameManager.submitWords = function(roomNum, words, playerId, callback){
		var gameCollection = require('../db/dbConfig.js')('games');
		gameManager.findRoom(roomNum, function(room){
			game = room.game;
			game.noun.push(words.noun);
			game.verb.push(words.verb);
			game.adverb.push(words.adverb);
			game.flavour.push(words.flavour);
			game.num += 1;

			var wordCollection = require('../db/dbConfig.js')('words');
			wordCollection.insert(words);

			gameManager.broadcastPlayerSubmitted(roomNum, playerId);

			gameCollection.update({"roomNum":roomNum},
				{$set:{'game':game}},function(err){
					if (err)
						callback(responseTypes.error);
					else{
						gameManager.checkNumWords(roomNum);
						callback(responseTypes.ok);
					}
				});
		})
	}

	gameManager.checkNumWords = function(roomNum){
		gameManager.findRoom(roomNum, function(room){
			if (room.game.num == room.game.maxNum)
			{
				setTimeout(gameManager.gameDisplay, 1000*2, roomNum);
			}
		});
	}

	gameManager.configForDisplay = function(roomNum, numSentences, callback){
		var gameCollection = require('../db/dbConfig')('games');
		gameCollection.update({'roomNum':roomNum},{$set:{
			'game.state':gameStates.renderingSubmissions,
			'game.num':-1,
			'game.maxNum':numSentences
		}}, function(err){
			if (err)
				console.log(err)
			else{
				gameManager.triggerStateChange(roomNum, gameStates.renderingSubmissions);
				gameManager.findRoom(roomNum,function(room){
					gameManager.nextSentence(roomNum);
					callback();
				});
			}
		});
	}

	gameManager.broadcastSentence = function(room)
	{
		console.log('Room ' + room.roomNum + ' broadcasting sentence: ' + room.game.sentences[room.game.num] + ' (' + (1.0*(room.game.num)+1) + '/' + room.game.maxNum +')');
		io.sockets.in(room.roomNum).emit('sentence', {sentence:room.game.sentences[room.game.num]});
	}

	gameManager.triggerStateChange = function(roomNum, newState){
		console.log('Room ' + roomNum + ' triggering state change to ' + gameManager.getKeyFromValue(gameStates, newState));
		io.sockets.in(roomNum).emit('gameStateChange', {state:newState});
	}

	gameManager.broadcastPlayerSubmitted = function(roomNum, playerId)
	{
		var i = -1;
		gameManager.findRoom(roomNum, function(room){
			room.players.forEach(function(player){
				i++
				if (player.playerId == playerId)
					io.sockets.in(roomNum).emit('playerSubmitted', {playerNum:i});
				});
			});
	}

	gameManager.generateSentences = function(roomNum, callback){
		gameManager.findRoom(roomNum, function(room){
			var words = {
				noun:room.game.noun,
				verb:room.game.verb,
				adverb:room.game.adverb,
				flavour:room.game.flavour
			};

			var players = [];

			room.players.forEach(function(player){
				players.push(player.playerName);
			});

			var sentences = [];

			while (words.noun.length > 0){
				sentences.push(
					gameManager.constructSentence(
						players.splice(gameManager.randInt(words.noun.length),1),
						words.verb.splice(gameManager.randInt(words.verb.length),1),
						words.noun.splice(gameManager.randInt(words.noun.length),1),
						words.adverb.splice(gameManager.randInt(words.adverb.length),1),
						words.flavour.splice(gameManager.randInt(words.flavour.length),1)
					));
			}
			var gameCollection = require('../db/dbConfig')('games');
			gameCollection.update({"roomNum":room.roomNum},
			{$set:{'game.sentences':sentences}}, function(){
				callback(sentences.length);
			});
		});
	}

	gameManager.constructSentence = function(){
		var sentence = '';
		for (var i = 0; i < arguments.length; i++)
			sentence = sentence + ' ' + arguments[i];
		sentence = sentence + '.';
		return sentence;
	}

	gameManager.randInt = function(max){
		var num = Math.floor(Math.random() * max);
		return num;
	}

	gameManager.findRoom = function(roomNum, callback){
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

	gameManager.getKeyFromValue = function(json, value)
	{
		for (item in json)
		{
			if (value == json[item])
			{
				return item;
			}
		}
	}

	gameManager.checkGameState = function(){
		var gameCollection = require('../db/dbConfig')('games');
	}

	return gameManager;
}
