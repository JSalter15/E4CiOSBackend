let pg = require('pg');
var Database = [];
var Hash = require('./Hash.js');

const DATABASE_URL = 'postgres://xeqtnkjlbzfhad:0f8eb3c9a777c80ad960ea9ac1dd010596b1991daf523f65db58682308d1fab7@ec2-23-23-223-2.compute-1.amazonaws.com:5432/d7o63skrv6brj5'
pg.defaults.ssl = true;

pg.connect(DATABASE_URL, function(err, client) {
  if (err) throw err;
  console.log('Connected to postgres! Getting schemas...');
});

/******************************************************************************
Account queries
*******************************************************************************/

Database.createAccount = function(firstname, lastname, email, password, profstatus, affiliation, expertise, country, age, gender, sectors, callback) {
	pg.connect(DATABASE_URL, function(err, client, done) {
		if (err) {
			done();
			callback(err);
		}

		client.query("SELECT EXISTS(SELECT * FROM users WHERE user_email = '" + email + "')").on('row', function(row, result) {
			if (row["exists"] == true) {
				done();
				let errorString = email + " is taken";
				callback(errorString);
			} else {

				// Hash password then insert the new user into users
				Hash.hashPassword(password, function(e, hash) {
					if (e)
						callback(e);
					client.query("INSERT INTO users (id, user_firstname, user_lastname, user_email, user_pass, user_profstatus, user_affiliation, user_expertise, user_country, user_age, user_gender, user_sectors) VALUES (uuid_generate_v4(), '" + firstname + "', '" + lastname + "', '" + email + "', '" + hash + "', '" + profstatus + "', '" + affiliation + "', '" + expertise + "', '" + country + "', " + age + ", '" + gender + "', ARRAY" + sectors + ")");
					client.query("SELECT * FROM users WHERE user_email = '" + email + "'").on('end', function(result) {
						let id = result.rows[0]["id"];
						done();
						callback(null, id);
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

		let query = client.query("SELECT * FROM users WHERE user_email = '" + email + "'").on('end', function(result) {
			if (result.rowCount == 0) callback("user does not exist");
			else {
				let id = result.rows[0]["id"];
				let firstname = result.rows[0]["user_firstname"];
				let lastname = result.rows[0]["user_lastname"];
				done();
				Hash.validatePassword(password, result.rows[0].user_pass, function(e, res) {
					if (e) callback(e);
					if (res) callback(null, {id : id, firstname : firstname, lastname: lastname});
					else callback("password or username does not match");
				});
			}
		})
	});
};

Database.deleteAccount = function(id, callback) {
	pg.connect(DATABASE_URL, function(err, client, done) {
		if (err) {
			done();
			callback(err);
		}

		client.query("DELETE FROM users WHERE id = '" + id + "'"); 
		done();
		callback(null, true);
	});
};


/******************************************************************************
Project queries
*******************************************************************************/

Database.createProject = function(owner, title, contributors, description, callback) {
	pg.connect(DATABASE_URL, function(err, client, done) {
		if (err) {
			done();
			callback(err);
		}

		client.query("SELECT EXISTS(SELECT * FROM projects WHERE title = '" + title + "')").on('row', function(row, result) {
			if (row["exists"] == true) {
				done();
				let errorString = "A project already exists with that title!";
				callback(errorString);
			} else {
				client.query("INSERT INTO projects (id, owner, title, contributors, description) VALUES (uuid_generate_v4(), '" + owner + "', '" + title + "', ARRAY" + contributors + "::uuid[], '" + description + "')");
				client.query("SELECT * FROM projects WHERE title = '" + title + "'").on('end', function(result) {
					let id = result.rows[0]["uuid"];
					done();
					callback(null, {id: id});
				});
				done()
			}
		});
	});
};

Database.addContributorToProject = function(projectid, contributorid, callback) {
	pg.connect(DATABASE_URL, function(err, client, done) {
		if (err) {
			done();
			callback(err);
		}

		client.query("UPDATE projects SET contributors = array_append(contributors, '" + contributorid + "') WHERE ID = '" + projectid + "' AND NOT contributors::text[] @> ARRAY['" + contributorid + "']");
		client.query("UPDATE users SET user_projects = array_append(user_projects, '" + projectid + "') WHERE ID = '" + contributorid + "' AND NOT user_projects::text[] @> ARRAY['" + projectid + "']");
		done();
		callback(null, 200);
	});
}

Database.removeContributorFromProject = function(projectid, contributorid, callback) {
	pg.connect(DATABASE_URL, function(err, client, done) {
		if (err) {
			done();
			callback(err);
		}

		client.query("UPDATE projects SET contributors = array_remove(contributors, '" + contributorid + "') WHERE ID = '" + projectid + "'");
		client.query("UPDATE users SET user_projects = array_remove(user_projects, '" + projectid + "') WHERE ID = '" + contributorid + "'");
		done();
		callback(null, 200);
	});
}

Database.getProjectByID = function(projectid, callback) {
	pg.connect(DATABASE_URL, function(err, client, done) {
		if (err) {
			done();
			callback(err);
		}

	});
}

Database.getProjectBySector = function(sector, callback) {
	pg.connect(DATABASE_URL, function(err, client, done) {
		if (err) {
			done();
			callback(err);
		}

	});
}

Database.getAllProjects = function(callback) {
	pg.connect(DATABASE_URL, function(err, client, done) {
		if (err) {
			done();
			callback(err);
		}

	});
}

Database.deleteProject = function(projectid, callback) {
	pg.connect(DATABASE_URL, function(err, client, done) {
		if (err) {
			done();
			callback(err);
		}

	});
}


/******************************************************************************
Search queries
*******************************************************************************/

Database.searchUsers = function(query, user, callback) {
	pg.connect(DATABASE_URL, function(err, client, done) {
		if (err) {
			done();
			callback(err);
		}

	});
}

Database.searchProjects = function(query, callback) {
	pg.connect(DATABASE_URL, function(err, client, done) {
		if (err) {
			done();
			callback(err);
		}

	});
}


module.exports = Database;