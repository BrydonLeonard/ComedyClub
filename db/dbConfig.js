var mongo = require('mongodb');
var monk = require('monk');
module.exports = function(){
	return monk('mongodb://localhost:27017/comClub');
}
