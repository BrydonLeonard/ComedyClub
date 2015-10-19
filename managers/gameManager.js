var Pusher = require('pusher');
var gameManager = {};

gameManager.gameStart = function(roomNum, callback)
{
	var pusher = new Pusher({
		appId: 'APP_ID_HERE',
		key: 'APP_KEY_HERE',
		secret: 'APP_SECRET_HERE'
	});
	var gameCollection = require('../db/dbConfig.js')('games');
	gameCollection.update({"roomNum":roomNum},
	{
		'game.state':gameStates.waitingSubmissions;
		'game.num':0,
		'game.maxNum':{$size:'game.players'}
	},function(err){
		if (err)
			callback(responseTypes.error);
		else {
			setTimeout(gameEnd, 1000*60, roomNum);
			pusher.trigger(roomNum, 'gameStateChange', {state:gamesStates.waitingSubmissions});
			callback(responseTypes.ok);
		}
	}
}

gameManager.gameEnd = function(roomNum)
{
	var pusher = new Pusher({
		appId: 'APP_ID_HERE',
		key: 'APP_KEY_HERE',
		secret: 'APP_SECRET_HERE'
	});
	gameManager.generateSentences(roomNum, function(){
		pusher.trigger(roomNum, 'gameStateChange', {state:gameStates.renderingSubmissions});
	});
}

gameManager.changeGameStateTo = function(roomNum, newState, callback)
{
	var gameCollection = require('../db/dbConfig')('games');
}

gameManager.submitWords = function(roomNum, words, callback)
{
	var gameCollection = require('../db/dbConfig.js')('games');
	gameCollection.update({"roomNum":roomNum},
		{$push:{"game.noun":.words.noun,
				"game.verb":words.verb,
				"game.adverb":words.adverb,
				"game.flavour":words.flavour}},function(err){
			if (err)
				callback(responseTypes.error);
			else{
				callback(responseTypes.ok);
			}
		});
}

gameManager.generateSentences = function(roomNum, callback)
{
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
					players.splice[randInt],
					words.verb.splice[randInt],
					words.noun.splice[randInt],
					words.adverb.splice[randInt],
					words.adverb.flavour[randInt]
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
	for (var i = 0; i < arguments.length)
		sentence = sentence + ' ' + arguments[i];
	sentence = sentence + '.';
	return sentence;
}

gameManager.randInt = function(max)
{
	return Math.round(Math.random() * max);
}

gameManager.findRoom = function(roomNum, callback)
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

gameManager.checkGameState = function(){
	var gameCollection = require('../db/dbConfig')('games');
		console.log('checking game state');
}

module.exports = gameManager;
