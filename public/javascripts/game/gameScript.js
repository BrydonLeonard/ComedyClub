var app = angular.module('gameScreenApp', ['doowb.angular-pusher','ngSanitize']).
	config(['PusherServiceProvider',
		function(PusherServiceProvider){
			PusherServiceProvider.setToken('comClubKey')//Not sure if this needs to be unique between all game rooms. We'll see
																									//If it does, maybe find some way of getting the room number when the new page is rendered
				.setOptions({});
		}]);


var gameStates = {
	'ready':0,
	'enterVerb':1,
	'enterNoun':2,
	'enterAdverb':3,
	'enterFlavour':4,
	'displaying':5,
	'waiting':6,
	'joined':7,
}
var instructions = [
	'You are now going to need to enter a series of words or phrases. <br />Press the button when you\'re ready to begin.',
	'Enter a transitive verb. <br />This is something that someone can do <b>to</b> someone or something else. <br />Timmy <b>licked</b> a lollipop enthusiastically because it was delicious',
	'Enter a common noun. <br />This is a <b>thing</b>. <br />Timmy licked <b>a lollipop</b> enthusiastically because it was delicious',
	'Enter an adverb. <br />This is the manner in which someone does a verb. <br />Timmy licked a lollipop <b>enthusiastically</b> because it was delicious',
	'Enter a <b>WORD</b>. <br />Timmy licked a lollipop enthusiastically <b>because it was delicious</b>',
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
	var sel = 'div[ng-controller="gameStateManager"]';
	console.log(angular.element(sel));
	return angular.element(sel).scope();
}


socket.emit('roomConnect', {roomNum:roomNum});

socket.on('sentence', function(data){
	var scope = getScope();
	scope.instructions = data.sentence;
	scope.$apply();
});

socket.on('gameStateChange', function(data){
	var scope = getScope();
	if (data.newState == serverStates.renderingSubmissions){
		ChangeGameStateTo(gameStates.displaying, scope);
		scope.entryFormVisible = false;
	}
	if (data.newState == serverStates.pregame){
		ChangeGameStateTo(gameStates.ready, scope);
		scope.startButtonVisible = false;
		scope.entryFormVisible = true;
	}
	if (data.newState == serverStates.waitingSubmissions){
		ChangeGameStateTo(gameStates.ready, scope);
		scope.startButtonVisible = true;
		scope.entryFormVisible = false;
	}
	scope.$apply();
});

app.controller('gameStateController', function($scope, $http){
	$scope.instructions = instructions[gameState];
	$scope.startButtonVisible = true;
	$scope.entryFormVisible = false;
	$scope.advanceGameState = function(){AdvanceGameState($scope,$http);}
	$scope.processWordEntry = function(words){
		ProcessWordEntry(words);
		AdvanceGameState($scope, $http);
	}
});

var ProcessWordEntry = function(words){
	storedWords[gameState-1] = words;
	console.log(roomNum);
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
