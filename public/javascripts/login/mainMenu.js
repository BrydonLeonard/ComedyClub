
var app = angular.module('mainMenuApp', []);

app.controller('enterRoomCtrlr', function($scope){
	$scope.enterRoom = function(){
		console.log('enterRoom');
	}
});

app.controller('newRoomCtrlr', function($scope){
	$scope.newRoom = function(){
		console.log('newRoom');
	}
});
