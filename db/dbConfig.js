module.exports = function(){
	var mongo = require('mongodb');
	var monk = require('monk');
	return monk('mongodb://localhost:27017/comClub');
}
