let pg = require('pg');
var Database = [];

const PG_DATABASE_URL = 'postgres://xeqtnkjlbzfhad:0f8eb3c9a777c80ad960ea9ac1dd010596b1991daf523f65db58682308d1fab7@ec2-23-23-223-2.compute-1.amazonaws.com:5432/d7o63skrv6brj5'
pg.defaults.ssl = true;

Database.getPostsForSectors = function(selectedSectors, postType, callback) {
	pg.connect(PG_DATABASE_URL, function(err, client, done) {
		if (err) {
			done();
			callback(err);
		}

		var termids = [];
		var finalResults = [];
		let selectedSectorsJoined = selectedSectors.join()
		client.query("SELECT term_id FROM wp_terms WHERE name IN (" + selectedSectorsJoined + ")").on('row', function(row, result) {
			console.log("HERE");
			termids.push(row.term_id);
		}).on('end', function(result) {

			let termidsJoined = termids.join()
			let query = client.query("SELECT object_id FROM wp_term_relationships WHERE term_taxonomy_id IN (" + termidsJoined + ")");
			console.log("HERE 2");
			var objectids = []
			query.on('row', function(row, results) {
				objectids.push(row.object_id);
			});
			query.on('end', function(results) {

				if (results.rowCount == 0) {
					done();
					return callback("no posts for category!");
				}

				let objectidsJoined = objectids.join()
				let query2 = client.query("SELECT * FROM wp_posts WHERE ID IN (" + objectidsJoined + ") AND post_type = '" + postType + "' ORDER BY post_date DESC");
				console.log("HERE 3");
				query2.on('end', function(result) {
					
					if (result.rowCount == 0) {
						done()
						return callback("no posts for category!");
					}

					done();
					callback(null, result.rows);
				});
			});
		});
	});
}

Database.getPostByID = function(postid, postType, callback) {
	pg.connect(PG_DATABASE_URL, function(err, client, done) {
		if (err) {
			done();
			callback(err);
		}

		client.query(`SELECT * FROM wp_posts WHERE ID = ${postid} AND post_type = '${postType}'`).on('end', function(result1) {
			if (result1.rowCount == 0) {
				done();
				return callback("post does not exist!");
			}

			let sectors = []
			let term_taxonomy_ids = []
			client.query(`SELECT * FROM wp_term_relationships WHERE object_id = ${result1.rows[0].id}`).on('row', function(row, result) {
				term_taxonomy_ids.push(row.term_taxonomy_id);
			}).on('end', function(result) {

				client.query("SELECT * FROM wp_terms WHERE term_id IN (" + term_taxonomy_ids.join() + ") AND (name = 'Featured' OR name = 'Water' OR name = 'Energy' OR name = 'Health' OR name = 'Agriculture' OR name = 'Sanitation' OR name = 'Information Systems' OR name = 'Housing' OR name = 'Transport')").on('row', function(row, result) {
					sectors.push(row.name);
				}).on('end', function(result) { 
					result1.rows[0].sectors = sectors;
					done();
					callback(null, result1.rows[0]);
				});
			});
		});
	});
}

Database.getAllWebinars = function(callback) {
	pg.connect(PG_DATABASE_URL, function(err, client, done) {
		if (err) {
			done();
			callback(err);
		}

		let query = client.query(`SELECT * FROM wp_posts WHERE post_type = 'wwebinars' ORDER BY post_date DESC`).on('end', function(result) {
			if (result.rowCount == 0) callback("no webinars!");
			else {
				done();
				callback(null, result.rows);
			}
		});
	});
}


Database.getAllNews = function(callback) {
	pg.connect(PG_DATABASE_URL, function(err, client, done) {
		if (err) {
			done();
			callback(err);
		}

		let query = client.query(`SELECT * FROM wp_posts WHERE post_type = 'post' ORDER BY post_date DESC`).on('end', function(result) {
			if (result.rowCount == 0) callback("no news!");
			else {
				done();
				callback(null, result.rows);
			}
		});

	});
}

Database.searchPosts = function(searchQuery, postType, callback) {
	pg.connect(PG_DATABASE_URL, function(err, client, done) {
		if (err) {
			done();
			callback(err);
		}

		let query = client.query(`SELECT * FROM wp_posts WHERE post_title ILIKE '%${searchQuery}%' AND post_type = '${postType}' ORDER BY post_date DESC`).on('end', function(result) {
			done();
			callback(null, result.rows);
		});
	});
}




module.exports = Database;