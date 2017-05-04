let pg = require('pg');
var Database = [];
var Hash = require('./hash.js');

const PG_DATABASE_URL = 'postgres://xeqtnkjlbzfhad:0f8eb3c9a777c80ad960ea9ac1dd010596b1991daf523f65db58682308d1fab7@ec2-23-23-223-2.compute-1.amazonaws.com:5432/d7o63skrv6brj5'
pg.defaults.ssl = true;

pg.connect(PG_DATABASE_URL, function(err, client) {
	if (err) throw err;
	console.log('Connected to postgres! Getting schemas...');
});

/******************************************************************************
Account queries
*******************************************************************************/

Database.createAccount = function(email, password, profstatus, affiliation, expertise, country, age, gender, callback) {
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
					client.query(`INSERT INTO users (id, user_email, user_pass, user_profstatus, user_affiliation, user_expertise, user_country, user_age, user_gender) VALUES (uuid_generate_v4(), '${email}', '${hash}', '${profstatus}', '${affiliation}', '${expertise}', ${country}, ${age}, '${gender}')`);
					client.query(`SELECT * FROM users WHERE user_email = '${email}'`).on('end', function(result) {
						done();
						callback(null, result.rows[0]);
					});
				});
			}
		});
	});
};

Database.editAccount = function(id, firstname, lastname, profstatus, affiliation, expertise, country, age, gender, description, callback) {
	pg.connect(PG_DATABASE_URL, function(err, client, done) {
		if (err) {
			done();
			callback(err);
		}

		client.query(`UPDATE users SET user_firstname = '${firstname}', user_lastname = '${lastname}', user_profstatus = ${profstatus}, user_affiliation = ${affiliation}, user_expertise = ${expertise}, user_country = ${country}, user_age = ${age}, user_gender = ${gender}, user_description = '${description}' WHERE id = '${id}'`).on('end', function(result) {
			if (result.rowCount == 0) {
				done();
				callback("user does not exist");
			}
			else {
				done()
				callback(null, 200);
			}
		})

	});
}

Database.validateUser = function(email, password, callback) {
	pg.connect(PG_DATABASE_URL, function(err, client, done) {
		if (err) {
			done();
			callback(err);
		}

		let query = client.query(`SELECT * FROM users WHERE user_email = '${email}'`).on('end', function(result) {
			if (result.rowCount == 0) {
				done()
				callback("user does not exist");
			}
			else {
				done();
				Hash.validatePassword(password, result.rows[0].user_pass, function(e, res) {
					if (e) callback(e);
					if (res) callback(null, result.rows[0]);
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
				done();
				callback(null, result.rows[0]);
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
Favorite management for news & webinars queries
*******************************************************************************/

Database.favoriteArticleForUser = function(articleid, userid, callback) {
	pg.connect(PG_DATABASE_URL, function(err, client, done) {
		if (err) {
			done();
			callback(err);
		}

		client.query(`UPDATE users SET fav_articles = array_append(fav_articles, ${articleid}) WHERE ID = '${userid}' AND NOT ${articleid} = ANY(fav_articles)`);
		done();
		callback(null, 200);
	});
}

Database.unfavoriteArticleForUser = function(articleid, userid, callback) {
	pg.connect(PG_DATABASE_URL, function(err, client, done) {
		if (err) {
			done();
			callback(err);
		}

		client.query(`UPDATE users SET fav_articles = array_remove(fav_articles, ${articleid}) WHERE ID = '${userid}'`);
		done();
		callback(null, 200);		
	});
}

Database.favoriteWebinarForUser = function(webinarid, userid, callback) {
	pg.connect(PG_DATABASE_URL, function(err, client, done) {
		if (err) {
			done();
			callback(err);
		}

		client.query(`UPDATE users SET fav_webinars = array_append(fav_webinars, ${webinarid}) WHERE ID = '${userid}' AND NOT ${webinarid} = ANY(fav_webinars)`);
		done();
		callback(null, 200);
		
	});
}

Database.unfavoriteWebinarForUser = function(webinarid, userid, callback) {
	pg.connect(PG_DATABASE_URL, function(err, client, done) {
		if (err) {
			done();
			callback(err);
		}

		client.query(`UPDATE users SET fav_webinars = array_remove(fav_webinars, ${webinarid}) WHERE ID = '${userid}'`);
		done();
		callback(null, 200);
	});
}

Database.getFavArticlesForUser = function(userid, callback) {
	pg.connect(PG_DATABASE_URL, function(err, client, done) {
		if (err) {
			done();
			callback(err);
		}

		var fav_articles;
		client.query(`SELECT * FROM users WHERE ID = '${userid}'`).on('end', function(result) {
			fav_articles = result.rows[0]["fav_articles"];

			if (fav_articles.length == 0) {
				done();
				return callback("user has no favorite articles");
			}
			client.query("SELECT * FROM wp_posts WHERE ID IN (" + fav_articles.join() + ")").on('end', function(result) {
						
				if (result.rowCount == 0) {
					done()
					return callback("user has no favorite articles");
				}
				done();
				callback(null, result.rows);
			});

		});

	});
}

Database.getFavWebinarsForUser = function(userid, callback) {
	pg.connect(PG_DATABASE_URL, function(err, client, done) {
		if (err) {
			done();
			callback(err);
		}

		var fav_webinars;
		client.query(`SELECT * FROM users WHERE ID = '${userid}'`).on('end', function(result) {
			fav_articles = result.rows[0]["fav_webinars"];

			if (fav_webinars.length == 0) {
				done();
				return callback("user has no favorite webinars");
			}
			client.query("SELECT * FROM wp_posts WHERE ID IN (" + fav_webinars.join() + ")").on('end', function(result) {
						
				if (result.rowCount == 0) {
					done()
					return callback("user has no favorite webinars");
				}
				done();
				callback(null, result.rows);
			});

		});
		
	});
}

/******************************************************************************
Project queries
*******************************************************************************/

Database.createProject = function(owner, title, contributors, description, sector, callback) {
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
				client.query(`INSERT INTO projects (id, owner, title, contributors, description, sector) VALUES (uuid_generate_v4(), '${owner}', '${title}', ARRAY${contributors}::uuid[], '${description}', '${sector}')`);
				client.query(`SELECT * FROM projects WHERE title = '${title}'`).on('end', function(result) {
					client.query(`UPDATE users SET user_projects = array_append(user_projects, '${result.rows[0].id}') WHERE id = '${owner}' AND NOT user_projects::text[] @> ARRAY['${result.rows[0].id}']`);
					done();
					callback(null, result.rows[0]);
				});
				done()
			}
		});
	});
};

Database.editProject = function(id, title, contributors, description, sector, callback) {
	pg.connect(PG_DATABASE_URL, function(err, client, done) {
		if (err) {
			done();
			callback(err);
		}

		client.query(`SELECT * FROM projects WHERE (title = '${title}' AND id != '${id}')`).on('end', function(result) {
			if (result.rowCount > 0) {
				done();
				let errorString = "A project already exists with that title!";
				return callback(errorString);
			} else {
				client.query(`UPDATE projects SET title = '${title}', contributors = ARRAY${contributors}::uuid[], description = '${description}', sector = '${sector}' WHERE id = '${id}'`);
				client.query(`SELECT * FROM projects WHERE title = '${title}'`).on('end', function(result) {
					done();
					callback(null, result.rows[0]);
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

		let query = client.query(`SELECT * FROM projects WHERE sector = '${sector}' ORDER BY date_created DESC`).on('end', function(result) {
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

Database.postCommentOnProject = function(authorid, projectid, content, callback) {
	pg.connect(PG_DATABASE_URL, function(err, client, done) {
		if (err) {
			done();
			callback(err);
		}

		client.query(`INSERT INTO project_comments (id, author_id, project_id, content) VALUES (uuid_generate_v4(), '${authorid}', '${projectid}', '${content}')`);
		client.query(`UPDATE projects SET num_comments = num_comments + 1 WHERE id = '${projectid}'`);
		done();
		callback(null, true);
	});
}

Database.deleteCommentForProject = function(commentid, projectid, callback) {
	pg.connect(PG_DATABASE_URL, function(err, client, done) {
		if (err) {
			done();
			callback(err);
		}

		client.query(`DELETE FROM project_comments WHERE id = '${commentid}'`);
		client.query(`UPDATE projects SET num_comments = num_comments - 1 WHERE id = '${projectid}'`);
		done();
		callback(null, true);
	});
}

Database.getAllCommentsForProject = function(projectid, callback) {
	pg.connect(PG_DATABASE_URL, function(err, client, done) {
		if (err) {
			done();
			callback(err);
		}

		client.query(`SELECT * FROM project_comments WHERE project_id = '${projectid}' ORDER BY date DESC`).on('end', function(result) {
			if (result.rowCount == 0) {
				done()
				callback("no comments on project!");
			}
			else {
				done();
				callback(null, result.rows);
			}
		}); 
	});
}

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