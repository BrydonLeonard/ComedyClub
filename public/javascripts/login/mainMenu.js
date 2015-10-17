
var app = angular.module('mainMenuApp', []);

app.controller('enterRoomCtrlr', function($scope){
	$scope.enterRoom = function(){
		console.log($scope.roomNumber);
	}
});
