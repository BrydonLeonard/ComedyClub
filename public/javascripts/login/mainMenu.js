
var app = angular.module('mainMenuApp', []);

app.controller('enterRoomCtrlr', function($scope){
	$scope.enterRoom = function(){
		$http.post({
			method:'POST'
		});
	}
});
