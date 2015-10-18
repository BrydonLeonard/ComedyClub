var app = angular.module('gameScreenApp', ['doowb.angular-pusher']).
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
	'You are now going to need to enter a series of words or phrases. \nPress the button when you\'re ready to begin.',
	'Enter a transitive verb. \nThis is something that someone can do <b>to</b> someone or something else. \nTimmy <b>licked</b> a lollipop enthusiastically because it was delicious',
	'Enter a common noun. \nThis is a <b>thing</b>. \nTimmy licked <b>a lollipop</b> enthusiastically because it was delicious',
	'Enter an adverb. \nThis is the manner in which someone does a verb. \nTimmy licked a lollipop <b>enthusiastically</b> because it was delicious',
	'Enter a <b>WORD</b>. \nTimmy licked a lollipop enthusiastically <b>because it was delicious</b>']

var storedWords = ['','','',''];

var gameState = gameStates.ready;

app.controller('gameStateController', function($scope){
	$scope.instructions = instructions[gameState];
	$scope.startButtonVisible = true;
	$scope.entryFormVisible = false;
	$scope.advanceGameState = function(){AdvanceGameState($scope);}
	$scope.processWordEntry = function(words){
		ProcessWordEntry(words);
		AdvanceGameState($scope);
	}
});

var ProcessWordEntry = function(words){
	storedWords[gameState-1] = words;
}

var SendWordsToServer = function()
{
	alert(storedWords);
}

var AdvanceGameState = function($scope){
	$scope.wordsInput = "";
	switch(gameState){
		case gameStates.ready:{
			ChangeGameStateTo(gameStates.enterVerb,$scope);
			$scope.startButtonVisible = false;
			$scope.entryFormVisible = true;
		}break;
		case gameStates.enterVerb:{ChangeGameStateTo(gameStates.enterNoun,$scope);}break;
		case gameStates.enterNoun:{ChangeGameStateTo(gameStates.enterAdverb,$scope);}break;
		case gameStates.enterAdverb:{ChangeGameStateTo(gameStates.enterFlavour,$scope);}break;
		case gameStates.enterFlavour:{
			ChangeGameStateTo(gameStates.displaying,$scope);
			$scope.entryFormVisible = false;
			SendWordsToServer();
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
