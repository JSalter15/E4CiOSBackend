let pg = require('pg');
var Database = [];
var Hash = require('./Hash.js');

const DATABASE_URL = 'postgres://xeqtnkjlbzfhad:0f8eb3c9a777c80ad960ea9ac1dd010596b1991daf523f65db58682308d1fab7@ec2-23-23-223-2.compute-1.amazonaws.com:5432/d7o63skrv6brj5'
pg.defaults.ssl = true;

pg.connect(DATABASE_URL, function(err, client) {
  if (err) throw err;
  console.log('Connected to postgres! Getting schemas...');
});

Database.createUser = function(firstname, lastname, email, password, profstatus, affiliation, country, age, gender, expertise, callback) {
	pg.connect(DATABASE_URL, function(err, client, done) {
		if (err) callback(err);

		client.query("SELECT EXISTS(SELECT * FROM users WHERE email = '" + email + "')").on('row', function(row, result) {
			if (row["exists"] == true) {
				done();
				let errorString = email + " is taken";
				callback(errorString);
			} else {

				// Hash password then insert the new user into users
				Hash.hashPassword(password, function(e, hash) {
					if (e)
						callback(e);
					client.query("INSERT INTO users (uuid, firstname, lastname, email, password, profstatus, affiliation, country, age, gender, expertise) VALUES (uuid_generate_v4(), '" + firstname + "', '" + lastname + "', '" + email + "', '" + hash + "', '" + profstatus + "', '" + affiliation + "', '" + country + "', " + age + ", '" + gender + "', ARRAY" + expertise + ")");
					client.query("SELECT * FROM users WHERE email = '" + email + "'").on('end', function(result) {
						let uuid = result.rows[0]["uuid"];
						done();
						callback(null, uuid);
					});
				});
			}
		});
	});
};

// Log in a user
Database.validateUser = function(email, password, callback) {
	pg.connect(DATABASE_URL, function(err, client, done) {
		if (err) {
			done();
			callback(err);
		}

		let query = client.query("SELECT * FROM users WHERE email = '" + email + "'").on('end', function(result) {
			if (result.rowCount == 0) callback("user does not exist");
			else {
				let uuid = result.rows[0]["uuid"];
				let firstname = result.rows[0]["firstname"];
				let lastname = result.rows[0]["lastname"];
				done();
				Hash.validatePassword(password, result.rows[0].password, function(e, res) {
					if (e) callback(e);
					if (res) callback(null, {uuid : uuid, firstname : firstname, lastname: lastname});
					else callback("password or username does not match");
				});
			}
		})
	});
};

Database.editUser = function() {

}

Database.deleteUser = function() {

}

Database.createProject = function(title, author, description, callback) {
	pg.connect(DATABASE_URL, function(err, client, done) {
		if (err) callback(err);

		client.query("SELECT EXISTS(SELECT * FROM projects WHERE title = '" + title + "')").on('row', function(row, result) {
			if (row["exists"] == true) {
				done();
				let errorString = "A project already exists with that title!";
				callback(errorString);
			} else {
				client.query("INSERT INTO projects (uuid, title, author, description) VALUES (uuid_generate_v4(), '" + title + "', '" + author + "', '" + description + "')");
				client.query("SELECT * FROM projects WHERE title = '" + title + "'").on('end', function(result) {
					let uuid = result.rows[0]["uuid"];
					done();
					callback(null, {uuid: uuid});
				});
				done()
			}
		});
	});
};

module.exports = Database;