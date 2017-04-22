let mysql = require('mysql')
var Database = [];

var mysqlConnection = mysql.createConnection({
	host     : 'mariadb-152.wc2',
	user     : '543772_stg_e4c',
	password : '5mPEyk3HDSs7',
	database : '543772_stg_e4c',
});

mysqlConnection.connect(function(err) {
	if (err) {
		console.error('error connecting: ' + err.stack);
		return;
	}

	console.log('connected as id ' + mysqlConnection.threadId);
});

module.exports = Database;