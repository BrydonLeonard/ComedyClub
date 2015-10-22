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
						setTimeout(gameManager.gameDisplay, 1000*20, roomNum);
						gameManager.triggerStateChange(roomNum, gameStates.waitingSubmissions);
						callback(responseTypes.ok);
					}
				});
			}
		})
	}

	gameManager.gameDisplay = function(roomNum){
		console.log(roomNum);
		gameManager.generateSentences(roomNum, function(numSentences){
			if (numSentences > 0){
				gameManager.configForDisplay(roomNum, numSentences, function(){
										setTimeout(gameManager.nextSentence, 1000*15, roomNum);
									});
					}
			});
	}

	gameManager.nextSentence = function(roomNum){
		gameManager.findRoom(roomNum, function(room){
			if (room.game.num < room.game.maxNum-1){
				var gameCollection = require('../db/dbConfig')('games');
				gameCollection.update({'roomNum':roomNum},{
					$inc:{'game.num':1}
				},function(){
					gameManager.broadcastSentence(room);
					setTimeout(gameManager.nextSentence, 1000*15, roomNum);
				});
			}else{
				var gameCollection = require('../db/dbConfig')('games');
				gameCollection.update({'roomNum':roomNum}, {$set:{
					'game.state':gameStates.pregame,
					'game.num':0,
					'game.maxNum':0
				}},function(){
					console.log(roomNum);
						gameManager.triggerStateChange(roomNum, gameStates.pregame);
				});
			}
		});
	}

	gameManager.submitWords = function(roomNum, words, callback){
		var gameCollection = require('../db/dbConfig.js')('games');
		gameManager.findRoom(roomNum, function(room){
			game = room.game;
			game.noun.push(words.noun);
			game.verb.push(words.verb);
			game.adverb.push(words.adverb);
			game.flavour.push(words.flavour);

			var wordCollection = require('../db/dbConfig.js')('words');
			wordCollection.insert(words);

			gameCollection.update({"roomNum":roomNum},
				{$set:{'game':game}},function(err){
					if (err)
						callback(responseTypes.error);
					else{
						callback(responseTypes.ok);
					}
				});
		})
	}

	gameManager.configForDisplay = function(roomNum, numSentences, callback){
		var gameCollection = require('../db/dbConfig')('games');
		gameCollection.update({'roomNum':roomNum},{$set:{
			'game.state':gameStates.renderingSubmissions,
			'game.num':0,
			'game.maxNum':numSentences
		}}, function(err){
			if (err)
				console.log(err)
			else{
				gameManager.triggerStateChange(roomNum, gameStates.renderingSubmissions);
				gameManager.findRoom(roomNum,function(err, room){
					console.log(room);
					if (err)
						console.log(err);
					else
						gameManager.broadcastSentence(room);
						callback();
				});
			}
		});
	}

	gameManager.broadcastSentence = function(room)
	{
		var nsp = io.of('/'+room.roomNum);
		console.log('Room ' + room.roomNum + ' broadcasting sentence: ' + room.game.sentences[room.game.num] + ' (' + room.game.num + '/' + room.game.maxNum +')');
		nsp.emit('sentence', {sentence:sentence});
	}

	gameManager.triggerStateChange = function(roomNum, newState){
		var nsp = io.of('/'+roomNum);
		console.log('Room ' + roomNum + ' triggering state change to ' + gameManager.getKeyFromValue(gameStates, newState));
		nsp.emit('gameStateChange', {state:newState});
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
			{$push:{'game.sentences':sentences}}, function(){
				callback(sentences.length);
			});
		});
	}

	gameManager.constructSentence = function(){
		var sentence = '';
		for (var i = 0; i < arguments.length-1; i++)
			sentence = sentence + ' ' + arguments[i];
		sentence = sentence + ' because ' + arguments[arguments.length-1] + '.';
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
