var express = require('express')
var app = express()
var Database_pg = require('./database_pg.js');
var Database_e4c = require('./database_e4c.js');
let bodyParser = require('body-parser');

let server = app.listen(process.env.PORT || 8080, function () {
    let port = server.address().port;
    console.log("App now running on port", port);
});

app.use(bodyParser.json());

// to support URL-encoded bodies
app.use(bodyParser.urlencoded({
  extended: true
}));

/******************************************************************************
Account APIs
*******************************************************************************/

app.post('/api/login', function(req, res, next) {
	var start = Date.now();
	Database_pg.validateUser(req.body.email, req.body.password, function(err, data) {
		if (err) return next(err);
		var duration = Date.now() - start;
		console.log(duration);
		res.status(200).json(data);
	});
});

app.post('/api/createaccount', function(req, res, next) {
	var start = Date.now();
	let email = req.body.email;
	let password = req.body.password;
	let profstatus = req.body.profstatus;
	let affiliation = req.body.affiliation;
	let expertise = req.body.expertise;
	let country = req.body.country;
	let age = req.body.age;
	let gender = req.body.gender;

	Database_pg.createAccount(email, password, profstatus, affiliation, expertise, country, age, gender, function(err, data) {
		if (err) return next(err);
		var duration = Date.now() - start;
		console.log(duration);
		res.status(200).json(data);
	});
});

app.post('/api/editaccount', function(req, res, next) {
	var start = Date.now();
	let id = req.body.id;
	let firstname = req.body.firstname;
	let lastname = req.body.lastname;
	let profstatus = req.body.profstatus;
	let affiliation = req.body.affiliation;
	let expertise = req.body.expertise;
	let country = req.body.country;
	let age = req.body.age;
	let gender = req.body.gender;
	let description = req.body.description;

	Database_pg.editAccount(id, firstname, lastname, profstatus, affiliation, expertise, country, age, gender, description, function(err, data) {
		if (err) return next(err);
		var duration = Date.now() - start;
		console.log(duration);
		res.status(200).json(data);
	});
});

// app.post('/api/editaccount', function(req, res, next) {

// });

app.post('/api/deleteaccount', function(req, res, next) {
	var start = Date.now();
	Database_pg.deleteAccount(req.body.userid, function(err, data) {
		if (err) return next(err);
		var duration = Date.now() - start;
		console.log(duration);
		res.status(200).json({message:"success"});
	})
});

app.post('/api/getuserbyid', function(req, res, next) {
	var start = Date.now();
	Database_pg.getUserByID(req.body.userid, function(err, data) {
		if (err) return next(err);
		var duration = Date.now() - start;
		console.log(duration);
		res.status(200).json(data);
	});
});

/******************************************************************************
News APIs
*******************************************************************************/

app.get('/api/getallnews', function(req, res, next) {
	var start = Date.now();
	Database_e4c.getAllNews(function(err, data) {
		if (err) return next(err);
		var duration = Date.now() - start;
		console.log(duration);
		res.status(200).json(data);
	});
});

app.post('/api/getnewsforsectors', function(req, res, next) {
	var start = Date.now();

	var allSectors = ["'Featured'", "'Water'", "'Energy'", "'Health'", "'Housing'", "'Agriculture'", "'Sanitation'", "'Information Systems'", "'Transport'"];
	var selectedSectors = []
	for(let i = 0; i < req.body.sectors.length; i++) {
		if (req.body.sectors[i]) {
			selectedSectors.push(allSectors[i]);
		}
	}

	Database_e4c.getPostsForSectors(selectedSectors, "post", function(err, data) {
		if (err) return next(err);
		var duration = Date.now() - start;
		console.log(duration);
		res.status(200).json(data);
	});
});

app.post('/api/getarticlebyid', function(req, res, next) {
	var start = Date.now();
	Database_e4c.getPostByID(req.body.id, "post", function(err, data) {
		if (err) return next(err);
		var duration = Date.now() - start;
		console.log(duration);
		res.status(200).json(data);
	});
});

app.post('/api/favoritearticleforuser', function(req, res, next) {
	var start = Date.now();
	Database_pg.favoriteArticleForUser(req.body.id, req.body.userid, function(err, data) {
		if (err) return next(err);
		var duration = Date.now() - start;
		console.log(duration);
		res.status(200).json(data);
	});
});

app.post('/api/unfavoritearticleforuser', function(req, res, next) {
	var start = Date.now();
	Database_pg.unfavoriteArticleForUser(req.body.id, req.body.userid, function(err, data) {
		if (err) return next(err);
		var duration = Date.now() - start;
		console.log(duration);
		res.status(200).json(data);
	});
});

app.post('/api/getfavarticlesforuser', function(req, res, next) {
	var start = Date.now();
	Database_pg.getFavArticlesForUser(req.body.userid, function(err, data) {
		if (err) return next(err);
		var duration = Date.now() - start;
		console.log(duration);
		res.status(200).json(data);
	});
});

app.post('/api/searchnews', function(req, res, next) {
	var start = Date.now();
	Database_e4c.searchPosts(req.body.query, 'post', function(err, data) {
		if (err) return next(err);
		var duration = Date.now() - start;
		console.log(duration);
		res.status(200).json(data);
	});
});


/******************************************************************************
Webinars APIs
*******************************************************************************/

app.get('/api/getallwebinars', function(req, res, next) {
	var start = Date.now();
	Database_e4c.getAllWebinars(function(err, data) {
		if (err) return next(err);
		var duration = Date.now() - start;
		console.log(duration);
		res.status(200).json(data);
	});
});

app.post('/api/getwebinarsforsectors', function(req, res, next) {
	var start = Date.now();
	
	var allSectors = ["'Featured'", "'Water'", "'Energy'", "'Health'", "'Housing'", "'Agriculture'", "'Sanitation'", "'ICT'", "'Transport'"];
	var selectedSectors = []
	for(let i = 0; i < req.body.sectors.length; i++) {
		if (req.body.sectors[i]) {
			selectedSectors.push(allSectors[i]);
		}
	}

	Database_e4c.getPostsForSectors(selectedSectors, "wwebinars", function(err, data) {
		if (err) return next(err);
		var duration = Date.now() - start;
		console.log(duration);
		res.status(200).json(data);
	});
});

app.post('/api/getwebinarbyid', function(req, res, next) {
	var start = Date.now();
	Database_e4c.getPostByID(req.body.id, "wwebinars", function(err, data) {
		if (err) return next(err);
		var duration = Date.now() - start;
		console.log(duration);
		res.status(200).json(data);
	});
});

app.post('/api/favoritewebinarforuser', function(req, res, next) {
	var start = Date.now();
	Database_pg.favoriteWebinarForUser(req.body.id, req.body.userid, function(err, data) {
		if (err) return next(err);
		var duration = Date.now() - start;
		console.log(duration);
		res.status(200).json(data);
	});
});

app.post('/api/unfavoritewebinarforuser', function(req, res, next) {
	var start = Date.now();
	Database_pg.unfavoriteWebinarForUser(req.body.id, req.body.userid, function(err, data) {
		if (err) return next(err);
		var duration = Date.now() - start;
		console.log(duration);
		res.status(200).json(data);
	});
});

app.post('/api/getfavwebinarsforuser', function(req, res, next) {
	var start = Date.now();
	Database_pg.getFavWebinarsForUser(req.body.userid, function(err, data) {
		if (err) return next(err);
		var duration = Date.now() - start;
		console.log(duration);
		res.status(200).json(data);
	});
});

app.post('/api/searchwebinars', function(req, res, next) {
	var start = Date.now();
	Database_e4c.searchPosts(req.body.query, 'wwebinars', function(err, data) {
		if (err) return next(err);
		var duration = Date.now() - start;
		console.log(duration);
		res.status(200).json(data);
	});
});

/*****************************************************************************
Project APIs
******************************************************************************/

app.post('/api/createproject', function(req, res, next) {
	var start = Date.now();
	Database_pg.createProject(req.body.owner, req.body.title, req.body.description, req.body.sector, req.body.owner_name, req.body.owner_email, function(err, data) {
		if (err) return next(err);
		var duration = Date.now() - start;
		console.log(duration);
		res.status(200).json(data);
	});
});

app.post('/api/editproject', function(req, res, next) {
	var start = Date.now();
	Database_pg.editProject(req.body.id, req.body.title, req.body.description, req.body.sector, req.body.owner_name, req.body.owner_email, function(err, data) {
		if (err) return next(err);
		var duration = Date.now() - start;
		console.log(duration);
		res.status(200).json(data);
	});
});

app.post('/api/addcontributortoproject', function(req, res, next) {
	var start = Date.now();
	Database_pg.addContributorToProject(req.body.projectid, req.body.contributorid, function(err, data) {
		if (err) return next(err);
		var duration = Date.now() - start;
		console.log(duration);
		res.status(200).json(data);
	});
});

app.post('/api/removecontributorfromproject', function(req, res, next) {
	var start = Date.now();
	Database_pg.removeContributorFromProject(req.body.projectid, req.body.contributorid, function(err, data) {
		if (err) return next(err);
		var duration = Date.now() - start;
		console.log(duration);
		res.status(200).json(data);
	});
});

app.post('/api/getprojectbyid', function(req, res, next) {
	var start = Date.now();
	Database_pg.getProjectByID(req.body.projectid, function(err, data) {
		if (err) return next(err);
		var duration = Date.now() - start;
		console.log(duration);
		res.status(200).json(data);
	});
});

app.post('/api/getprojectsforuser', function(req, res, next) {
	var start = Date.now();
	Database_pg.getProjectsForUser(req.body.userid, function(err, data) {
		if (err) return next(err);
		var duration = Date.now() - start;
		console.log(duration);
		res.status(200).json(data);
	});
});

app.post('/api/getprojectsbysector', function(req, res, next) {
	var start = Date.now();
	Database_pg.getProjectsBySector(req.body.sector, function(err, data) {
		if (err) return next(err);
		var duration = Date.now() - start;
		console.log(duration);
		res.status(200).json(data);
	});
});

app.get('/api/getallprojects', function(req, res, next) {
	var start = Date.now();
	Database_pg.getAllProjects(function(err, data) {
		if (err) return next(err);
		var duration = Date.now() - start;
		console.log(duration);
		res.status(200).json(data);
	});
});

app.post('/api/deleteproject', function(req, res, next) {
	var start = Date.now();
	Database_pg.deleteProject(req.body.projectid, function(err, data) {
		if (err) return next(err);
		var duration = Date.now() - start;
		console.log(duration);
		res.status(200).json(data);
	});
});

app.post('/api/postcommentonproject', function(req, res, next) {
	var start = Date.now();
	Database_pg.postCommentOnProject(req.body.authorid, req.body.projectid, req.body.content, function(err, data) {
		if (err) return next(err);
		var duration = Date.now() - start;
		console.log(duration);
		res.status(200).json(data);
	});
});

app.post('/api/deletecommentforproject', function(req, res, next) {
	var start = Date.now();
	Database_pg.deleteCommentForProject(req.body.commentid, req.body.projectid, function(err, data) {
		if (err) return next(err);
		var duration = Date.now() - start;
		console.log(duration);
		res.status(200).json(data);
	});
});

app.post('/api/getallcommentsforproject', function(req, res, next) {
	var start = Date.now();
	Database_pg.getAllCommentsForProject(req.body.projectid, function(err, data) {
		if (err) return next(err);
		var duration = Date.now() - start;
		console.log(duration);
		res.status(200).json(data);
	});
});

/******************************************************************************
Search APIs
*******************************************************************************/

app.post('/api/searchusers', function(req, res, next) {
	var start = Date.now();
	Database_pg.searchUsers(req.body.query, function(err, data) {
		if (err) return next(err);
		var duration = Date.now() - start;
		console.log(duration);
		res.status(200).json(data)
	});
});

app.post('/api/searchprojects', function(req, res, next) {
	var start = Date.now();
	Database_pg.searchProjects(req.body.query, function(err, data) {
		if (err) return next(err);
		var duration = Date.now() - start;
		console.log(duration);
		res.status(200).json(data)
	});
});
