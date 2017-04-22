let pg = require('pg');
let mysql = require('mysql')
var Database = [];
var Hash = require('./Hash.js');

const PG_DATABASE_URL = 'postgres://xeqtnkjlbzfhad:0f8eb3c9a777c80ad960ea9ac1dd010596b1991daf523f65db58682308d1fab7@ec2-23-23-223-2.compute-1.amazonaws.com:5432/d7o63skrv6brj5'
pg.defaults.ssl = true;

pg.connect(PG_DATABASE_URL, function(err, client) {
	if (err) throw err;
	console.log('Connected to postgres! Getting schemas...');
});

// var mysqlConnection = mysql.createConnection({
// 	host     : 'mariadb-152.wc2',
// 	user     : '543772_stg_e4c',
// 	password : '5mPEyk3HDSs7',
// 	database : '543772_stg_e4c',
// });

// mysqlConnection.connect(function(err) {
// 	if (err) {
// 		console.error('error connecting: ' + err.stack);
// 		return;
// 	}

// 	console.log('connected as id ' + mysqlConnection.threadId);
// });


/******************************************************************************
Account queries
*******************************************************************************/

Database.createAccount = function(firstname, lastname, email, password, profstatus, affiliation, expertise, country, age, gender, sectors, callback) {
	pg.connect(PG_DATABASE_URL, function(err, client, done) {
		if (err) {
			done();
			callback(err);
		}

		client.query(`SELECT EXISTS(SELECT * FROM users WHERE user_email = '${email}')`).on('row', function(row, result) {
			if (row["exists"] == true) {
				done();
				let errorString = email + " is taken";
				callback(errorString);
			} else {

				// Hash password then insert the new user into users
				Hash.hashPassword(password, function(e, hash) {
					if (e)
						callback(e);
					client.query(`INSERT INTO users (id, user_firstname, user_lastname, user_email, user_pass, user_profstatus, user_affiliation, user_expertise, user_country, user_age, user_gender, user_sectors) VALUES (uuid_generate_v4(), '${firstname}', '${lastname}', '${email}', '${hash}', '${profstatus}', '${affiliation}', '${expertise}', '${country}', ${age}, '${gender}', ARRAY${sectors})`);
					client.query(`SELECT * FROM users WHERE user_email = '${email}'`).on('end', function(result) {
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
	pg.connect(PG_DATABASE_URL, function(err, client, done) {
		if (err) {
			done();
			callback(err);
		}

		let query = client.query(`SELECT * FROM users WHERE user_email = '${email}'`).on('end', function(result) {
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

Database.getUserByID = function(userid, callback) {
	pg.connect(PG_DATABASE_URL, function(err, client, done) {
		if (err) {
			done();
			callback(err);
		}

		let query = client.query(`SELECT * FROM users WHERE id = '${userid}'`).on('end', function(result) {
			if (result.rowCount == 0) callback("user does not exist");
			else {

				let data = {
					firstname	:  result.rows[0]["user_firstname"],
					lastname	:  result.rows[0]["user_lastname"],
					affiliation :  result.rows[0]["user_affiliation"],
					expertise	:  result.rows[0]["user_expertise"],
					sectors		:  result.rows[0]["user_sectors"],
					projects	:  result.rows[0]["user_projects"]
				};

				done();
				callback(null, data);
			}
		})
	});
}

Database.deleteAccount = function(id, callback) {
	pg.connect(PG_DATABASE_URL, function(err, client, done) {
		if (err) {
			done();
			callback(err);
		}

		client.query(`DELETE FROM users WHERE id = '${id}'`); 
		done();
		callback(null, 200);
	});
};


/******************************************************************************
Project queries
*******************************************************************************/

Database.createProject = function(owner, title, contributors, description, sectors, callback) {
	pg.connect(PG_DATABASE_URL, function(err, client, done) {
		if (err) {
			done();
			callback(err);
		}

		client.query(`SELECT EXISTS(SELECT * FROM projects WHERE title = '${title}')`).on('row', function(row, result) {
			if (row["exists"] == true) {
				done();
				let errorString = "A project already exists with that title!";
				callback(errorString);
			} else {
				client.query(`INSERT INTO projects (id, owner, title, contributors, description, sectors) VALUES (uuid_generate_v4(), '${owner}', '${title}', ARRAY${contributors}::uuid[], '${description}', ARRAY${sectors}::varchar(11)[])`);
				client.query(`SELECT * FROM projects WHERE title = '${title}'`).on('end', function(result) {
					let id = result.rows[0]["id"];
					done();
					callback(null, {id: id});
				});
				done()
			}
		});
	});
};

Database.addContributorToProject = function(projectid, contributorid, callback) {
	pg.connect(PG_DATABASE_URL, function(err, client, done) {
		if (err) {
			done();
			callback(err);
		}

		client.query(`UPDATE projects SET contributors = array_append(contributors, '${contributorid}') WHERE ID = '${projectid}' AND NOT contributors::text[] @> ARRAY['${contributorid}']`);
		client.query(`UPDATE users SET user_projects = array_append(user_projects, '${projectid}') WHERE ID = '${contributorid}' AND NOT user_projects::text[] @> ARRAY['${projectid}']`);
		done();
		callback(null, 200);
	});
};

Database.removeContributorFromProject = function(projectid, contributorid, callback) {
	pg.connect(PG_DATABASE_URL, function(err, client, done) {
		if (err) {
			done();
			callback(err);
		}

		client.query(`UPDATE projects SET contributors = array_remove(contributors, '${contributorid}') WHERE ID = '${projectid}'`);
		client.query(`UPDATE users SET user_projects = array_remove(user_projects, '${projectid}') WHERE ID = '${contributorid}'`);
		done();
		callback(null, 200);
	});
};

Database.getProjectByID = function(projectid, callback) {
	pg.connect(PG_DATABASE_URL, function(err, client, done) {
		if (err) {
			done();
			callback(err);
		}

		let query = client.query(`SELECT * FROM projects WHERE id = '${projectid}'`).on('end', function(result) {
			if (result.rowCount == 0) callback("project does not exist");
			else {
				done();
				callback(null, result.rows[0]);
			}
		});
	});
};

Database.getProjectsBySector = function(sector, callback) {
	pg.connect(PG_DATABASE_URL, function(err, client, done) {
		if (err) {
			done();
			callback(err);
		}

		let query = client.query(`SELECT * FROM projects WHERE '${sector}' = ANY(sectors) ORDER BY date_created DESC`).on('end', function(result) {
			if (result.rowCount == 0) callback("no projects for that sector");
			else {
				done();
				callback(null, result.rows);
			}
		});

	});
};

Database.getAllProjects = function(callback) {
	pg.connect(PG_DATABASE_URL, function(err, client, done) {
		if (err) {
			done();
			callback(err);
		}

		let query = client.query(`SELECT * FROM projects ORDER BY date_created DESC`).on('end', function(result) {
			if (result.rowCount == 0) callback("no projects!");
			else {
				done();
				callback(null, result.rows);
			}
		});
	});
};

Database.deleteProject = function(projectid, callback) {
	pg.connect(PG_DATABASE_URL, function(err, client, done) {
		if (err) {
			done();
			callback(err);
		}

		client.query(`DELETE FROM projects WHERE id = '${projectid}'`); 
		done();
		callback(null, true);
	});
};


/******************************************************************************
Search queries
*******************************************************************************/

Database.searchUsers = function(searchQuery, callback) {
	pg.connect(PG_DATABASE_URL, function(err, client, done) {
		if (err) {
			done();
			callback(err);
		}

		let query = client.query(`SELECT * FROM users WHERE user_firstname || ' ' || user_lastname ILIKE '%${searchQuery}%' OR array_to_string(user_sectors, '|') ILIKE '%${searchQuery}%' OR user_country ILIKE '%${searchQuery}%'`).on('end', function(result) {
			done();
			callback(null, result.rows);
		});


	});
};

Database.searchProjects = function(searchQuery, callback) {
	pg.connect(PG_DATABASE_URL, function(err, client, done) {
		if (err) {
			done();
			callback(err);
		}

		let query = client.query(`SELECT * FROM projects WHERE title ILIKE '%${searchQuery}%' OR description ILIKE '%${searchQuery}%' OR array_to_string(sectors, '|') ILIKE '%${searchQuery}%' ORDER BY date_created DESC`).on('end', function(result) {
			done();
			callback(null, result.rows);
		});
	});
};

module.exports = Database;