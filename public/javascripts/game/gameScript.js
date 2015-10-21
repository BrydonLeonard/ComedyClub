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
	'Enter a <b>WORD</b>. <br />Timmy licked a lollipop enthusiastically <b>because it was delicious</b>']

var msgTypes = {
		'startGame':0,
		'wordSubmission':1
	}
var storedWords = ['','','',''];

var gameState = gameStates.ready;

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
}

var SendWordsToServer = function($http)
{
	$http.post('',{
		data:{
			msgType:msgTypes.wordSubmission,
			words:storedWords
		}
	},{}).then(function(response){
		alert(response);
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
			ChangeGameStateTo(gameStates.displaying,$scope);
			SendWordsToServer($http);
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
