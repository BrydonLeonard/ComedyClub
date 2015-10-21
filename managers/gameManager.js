var Pusher = require('pusher');
var gameManager = {};

var gameStates = {
	'pregame':0,
	'waitingSubmissions':1,
	'renderingSubmissions':2
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
	console.log('setting up pusher');
	var pusher = new Pusher({
		appId: 'APP_ID_HERE',
		key: 'APP_KEY_HERE',
		secret: 'APP_SECRET_HERE'
	});
	console.log('starting game');
	var gameCollection = require('../db/dbConfig.js')('games');
	gameManager.findRoom(roomNum, function(room){
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
			console.log(err);
			if (err)
				callback(responseTypes.error);
			else {
				setTimeout(gameManager.gameDisplay, 1000*10, roomNum);
				pusher.trigger(roomNum, 'gameStateChange', {state:gameStates.waitingSubmissions});
				callback(responseTypes.ok);
			}
		});
	})
}

gameManager.gameDisplay = function(roomNum){
	var pusher = new Pusher({
		appId: 'APP_ID_HERE',
		key: 'APP_KEY_HERE',
		secret: 'APP_SECRET_HERE'
	});
	gameManager.generateSentences(roomNum, function(numSentences){
		if (numSentences > 0){
			gameManager.configForDisplay(roomNum, numSentences, function(){
				req.send(responseTypes.ok);
			});
		}
	});
}

gameManager.nextSentence = function(roomNum){
	gameManager.findRoom(roomNum, function(room){
		if (room.game.num < room.game.maxNum){
			var gameCollection = require('../db/dbConfig')('games');
			gameCollection.update({'roomNum':roomNum},{
				$inc:{'num':1}
			},function(roomNum){
				triggerStateChange(roomNum, gameStates.renderingSubmissions);
			});
		}else{
			var gameCollection = require('../db/dbConfig')('games');
			gameCollection.update({'roomNum':roomNum}, {
				'game.state':gameStates.pregame,
				'game.num':0,
				'game.maxNum':0
			},function(){
					triggerStateChange(roomNum, gameStates.pregame);
			});
		}
	});
}

gameManager.submitWords = function(roomNum, words, callback){
	var gameCollection = require('../db/dbConfig.js')('games');
	console.log('submitWords');
	console.log('noun ' + words[wordInArrayPos.noun]);
	gameCollection.update({"roomNum":roomNum},
		{$push:{'game.noun':words[wordInArrayPos.noun],
						'game.verb':words[wordInArrayPos.verb],
						'game.adverb':words[wordInArrayPos.adverb],
						'game.flavour':words[wordInArrayPos.flavour]}},function(err){
			if (err)
				callback(responseTypes.error);
			else{
				callback(responseTypes.ok);
			}
		});
}

gameManager.configForDisplay = function(roomNum, numSentences, callback){
	var gameCollection = require('../db/dbConfig')('games');
	gameCollection.update({'roomNum':roomNum},{$set:{
		'game.state':gameStates.renderingSubmissions,
		'game.num':0,
		'game.maxNum':numSentences
	}}, function(){
		gameManager.triggerStateChange(roomNum, gameStates.renderingSubmissions);
		callback();
	});
}

gameManager.triggerStateChange = function(roomNum, newState){
	pusher.trigger(roomNum, 'gameStateChange', {state:newState});
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
					players.splice[gameManager.randInt(words.noun.length)],
					words.verb.splice[gameManager.randInt(words.verb.length)],
					words.noun.splice[gameManager.randInt(words.noun.length)],
					words.adverb.splice[gameManager.randInt(words.adverb.length)],
					words.flavour.splice[gameManager.randInt(words.flavour.length)]
				));
		}
		var gameCollection = require('../db/dbConfig')('games');
		gameCollection.update({"roomNum":room.roomNum},
		{$set:{'game.sentences':[]},
		$push:{'game.sentences':sentences}}, callback);
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
	return Math.round(Math.random() * max);
}

gameManager.findRoom = function(roomNum, callback){
	var gameCollection = require('../db/dbConfig')('games');
	gameCollection.findOne({'roomNum':roomNum},{},function(err, room){
		if (err){
			console.log("Error while searching for room: " + roomNum + '. \n' + err);
			next(err);
		}else{
			console.log(room);
			callback(room);
		}
	});
}

gameManager.checkGameState = function(){
	var gameCollection = require('../db/dbConfig')('games');
		console.log('checking game state');
}

module.exports = gameManager;
