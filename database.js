let pg = require('pg');

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

					client.query("INSERT INTO users (uuid, firstname, lastname, email, password, profstatus, affiliation, country, age, gender, expertise, articles, webinars, projects) VALUES (uuid_generate_v4()'" + "', '" + firstname + "', '" + lastname + "', '" + email + "', '" + hash + "', '" + profstatus + "', '" + affiliation + "', '" + country + "', '" + age + "', '" + gender + "', '" + expertise + "', [], [], [])");
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