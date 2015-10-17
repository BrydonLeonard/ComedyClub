module.exports = function(session){
	var mongoStore = require('connect-mongodb-session')(session);
	return new mongoStore({
		uri:'mongodb://localhost:27017/playerSessionStore',
		collection:'players'
	});
}
