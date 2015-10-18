module.exports = function(collection){
	var mongo = require('mongodb');
	var monk = require('monk');
	var db = monk('mongodb://localhost:27017/comClub');
	if (collection)
		return db.get(collection);
	else return db;
}
