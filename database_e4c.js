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
		client.query("SELECT term_id FROM wp_terms WHERE name IN (" + selectedSectors.join() + ")").on('row', function(row, result) {
			termids.push(row.term_id);
		}).on('end', function(result) {

			let query = client.query("SELECT object_id FROM wp_term_relationships WHERE term_taxonomy_id IN (" + termids.join() + ")");

			var objectids = []
			query.on('row', function(row, results) {
				objectids.push(row.object_id);
			});
			query.on('end', function(results) {

				if (results.rowCount == 0) {
					done();
					return callback("no posts for category!");
				}

				let ids = objectids.join();
				client.query("SELECT * FROM wp_posts WHERE ID IN (" + objectids.join() + ") AND post_type = '" + postType + "' ORDER BY post_date DESC").on('end', function(result) {
					
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

Database.getPostByID = function(postid, callback) {
	pg.connect(PG_DATABASE_URL, function(err, client, done) {
		if (err) {
			done();
			callback(err);
		}

		client.query(`SELECT * FROM wp_posts WHERE ID = ${postid}`).on('end', function(result) {
			if (result.rowCount == 0) {
				done();
				return callback("post does not exist!");
			}
			done();
			callback(null, result.rows[0]);
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


module.exports = Database;