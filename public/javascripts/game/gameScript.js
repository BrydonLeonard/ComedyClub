var app = angular.module('gameScreenApp', ['ngSanitize']);


var gameStates = {
	'ready':0,
	'enterVerb':1,
	'enterNoun':2,
	'enterAdverb':3,
	'enterFlavour':4,
	'displaying':5,
	'waiting':6,
	'joined':7
}
var instructions = [
	'You are now going to need to enter a series of words or phrases. <br />Press the button when you\'re ready to begin.',
	'Enter a transitive verb. <br />This is something that someone can do <b>to</b> someone or something else. <br />Timmy <b>licked</b> a lollipop enthusiastically because it was delicious',
	'Enter a common noun. <br />This is a <b>thing</b>. <br />Timmy licked <b>a lollipop</b> enthusiastically because it was delicious',
	'Enter an adverb. <br />This is the manner in which someone does a verb. <br />Timmy licked a lollipop <b>enthusiastically</b> because it was delicious',
	'Enter some <b>#flavourText</b>. <br />Timmy licked a lollipop enthusiastically <b>because it was delicious</b>',
	'null',
	'Now waiting for the other players']

var serverStates = {
	'pregame':0,
	'waitingSubmissions':1,
	'renderingSubmissions':2,
	'pregameNoRender':3
}

var msgTypes = {
		'startGame':0,
		'wordSubmission':1
	}
var storedWords = ['','','',''];

var gameState = gameStates.ready;

var roomNum = window.location.href.split('/')[window.location.href.split('/').length-1];
var socket = io('http://localhost:3000');

var getScope = function(){
	var sel = 'div[id="cont"]';
	return angular.element(sel).scope();
}


socket.emit('roomConnect', {roomNum:roomNum});

socket.on('sentence', function(data){
	var scope = getScope();
	scope.instructions = data.sentence;
	scope.$apply();
});

socket.on('newPlayer', function(data){
	var scope = getScope();
	console.log('New player : ' + data.playerName);
	scope.playerList.push(data.playerName);
	console.log(data.playerName);
	scope.$apply();
});

socket.on('gameStateChange', function(data){
	var scope = getScope();
	if (data.state === serverStates.renderingSubmissions){
		ChangeGameStateTo(gameStates.displaying, scope);
		scope.entryFormVisible = false;
	}else	if (data.state === serverStates.pregame){
		ChangeGameStateTo(gameStates.ready, scope);
		scope.startButtonVisible = true;
		scope.entryFormVisible = false;
	}else	if (data.state === serverStates.waitingSubmissions && gameState == gameStates.ready || gameState == gameStates.displaying){
		ChangeGameStateTo(gameStates.ready, scope);
		scope.startButtonVisible = true;
		scope.entryFormVisible = false;
	}
	scope.$apply();
});

app.controller('gameStateController', ['$scope', '$http', '$location', '$window',  function($scope, $http, $location, $window){
	$scope.instructions = instructions[gameState];
	$scope.startButtonVisible = true;
	$scope.entryFormVisible = false;
	$scope.playerList = [];
	$scope.advanceGameState = function(){AdvanceGameState($scope,$http);}
	$scope.processWordEntry = function(words){
		ProcessWordEntry(words);
		AdvanceGameState($scope, $http);
	}
		$http.get('/room/playerId').then(function(resp){
			socket.emit('playerId', {playerId:resp.data});
		});
		$http.get('/room/'+roomNum+'/players').then(function(res){
			if (!res.data.players){
				var path = String($location.absUrl());
				path = path.split('/');
				var newPath = '';
				for (var i = 0; i < path.length - 2; i++)
				{
					newPath += path[i]+'/';
				}
				console.log(newPath);
				$window.location.href = newPath;
			}
			else{
				res.data.players.forEach(function(player){
					$scope.playerList.push(player.playerName);
				});
			}
		});
}]);

var ProcessWordEntry = function(words){
	storedWords[gameState-1] = words;
}

var SendWordsToServer = function($http)
{
	$http.post('',{
		data:{
			msgType:msgTypes.wordSubmission,
			words:{
				verb:storedWords[0],
				noun:storedWords[1],
				adverb:storedWords[2],
				flavour:storedWords[3]}
		}
	},{}).then(function(response){
	});
}

var SendReadyToServer = function($http){
	$http.post('', {
		data:{
			msgType:msgTypes.startGame
		}
	});
}

var AdvanceGameState = function($scope, $http){
	$scope.wordsInput = "";
	switch(gameState){
		case gameStates.ready:{
			ChangeGameStateTo(gameStates.enterVerb,$scope);
			SendReadyToServer($http);
			$scope.startButtonVisible = false;
			$scope.entryFormVisible = true;
		}break;
		case gameStates.enterVerb:{ChangeGameStateTo(gameStates.enterNoun,$scope);}break;
		case gameStates.enterNoun:{ChangeGameStateTo(gameStates.enterAdverb,$scope);}break;
		case gameStates.enterAdverb:{ChangeGameStateTo(gameStates.enterFlavour,$scope);}break;
		case gameStates.enterFlavour:{
			ChangeGameStateTo(gameStates.waiting,$scope);
			SendWordsToServer($http);
			$scope.entryFormVisible = false;
		}break;
		case gameStates.displaying:{
		}break;
	}
}

var ChangeGameStateTo = function(newGameState, $scope)
{
	gameState = newGameState;
	$scope.instructions = instructions[gameState];
}
