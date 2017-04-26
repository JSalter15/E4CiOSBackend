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
	Database_pg.validateUser(req.body.email, req.body.password, function(err, data) {
		if (err) return next(err);
		res.status(200).json(data);
	});
});

app.post('/api/createaccount', function(req, res, next) {
	let email = req.body.email;
	let password = req.body.password;
	let profstatus = req.body.profstatus;
	let affiliation = req.body.affiliation;
	let expertise = req.body.expertise;
	let country = req.body.country;
	let age = req.body.age;
	let gender = req.body.gender;
	let sectors = req.body.sectors;

	Database_pg.createAccount(email, password, profstatus, affiliation, expertise, country, age, gender, sectors, function(err, data) {
		if (err) return next(err);
		res.status(200).json(data);
	});
});

app.post('/api/editaccount', function(req, res, next) {
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
		res.status(200).json(data);
	});
});

// app.post('/api/editaccount', function(req, res, next) {

// });

app.post('/api/deleteaccount', function(req, res, next) {
	Database_pg.deleteAccount(req.body.userid, function(err, data) {
		if (err) return next(err);
		res.status(200).json({message:"success"});
	})
});

app.post('/api/getuserbyid', function(req, res, next) {
	Database_pg.getUserByID(req.body.userid, function(err, data) {
		if (err) return next(err);
		res.status(200).json(data);
	});
});

/******************************************************************************
News APIs
*******************************************************************************/

app.get('/api/getallnews', function(req, res, next) {
	Database_e4c.getAllNews(function(err, data) {
		if (err) return next(err);
		res.status(200).json(data);
	});
});

app.post('/api/getnewsforcategory', function(req, res, next) {
	Database_e4c.getPostsForCategory(req.body.category, "post", function(err, data) {
		if (err) return next(err);
		res.status(200).json(data);
	});
});

app.post('/api/getarticlebyid', function(req, res, next) {
	Database_e4c.getPostByID(req.body.articleid, function(err, data) {
		if (err) return next(err);
		res.status(200).json(data);
	});
});

app.post('/api/favoritearticleforuser', function(req, res, next) {
	Database_pg.favoriteArticleForUser(req.body.articleid, req.body.userid, function(err, data) {
		if (err) return next(err);
		res.status(200).json(data);
	});
});

app.post('/api/unfavoritearticleforuser', function(req, res, next) {
	Database_pg.unfavoriteArticleForUser(req.body.articleid, req.body.userid, function(err, data) {
		if (err) return next(err);
		res.status(200).json(data);
	});
});

app.post('/api/getfavarticlesforuser', function(req, res, next) {
	Database_pg.getFavArticlesForUser(req.body.userid, function(err, data) {
		if (err) return next(err);
		res.status(200).json(data);
	});
});


/******************************************************************************
Webinars APIs
*******************************************************************************/

app.get('/api/getallwebinars', function(req, res, next) {
	Database_e4c.getAllWebinars(function(err, data) {
		if (err) return next(err);
		res.status(200).json(data);
	});
});

app.post('/api/getwebinarsforcategory', function(req, res, next) {
	Database_e4c.getPostsForCategory(req.body.category, "wwebinars", function(err, data) {
		if (err) return next(err);
		res.status(200).json(data);
	});
});

app.post('/api/getwebinarbyid', function(req, res, next) {
	Database_e4c.getPostByID(req.body.articleid, function(err, data) {
		if (err) return next(err);
		res.status(200).json(data);
	});
});

app.post('/api/favoritewebinarforuser', function(req, res, next) {
	Database_pg.favoriteWebinarForUser(req.body.webinarid, req.body.userid, function(err, data) {
		if (err) return next(err);
		res.status(200).json(data);
	});
});

app.post('/api/unfavoritewebinarforuser', function(req, res, next) {
	Database_pg.unfavoriteWebinarForUser(req.body.webinarid, req.body.userid, function(err, data) {
		if (err) return next(err);
		res.status(200).json(data);
	});
});

app.post('/api/getfavwebinarsforuser', function(req, res, next) {
	Database_pg.getFavWebinarsForUser(req.body.userid, function(err, data) {
		if (err) return next(err);
		res.status(200).json(data);
	});
});


/*****************************************************************************
Project APIs
******************************************************************************/

app.post('/api/createproject', function(req, res, next) {
	Database_pg.createProject(req.body.owner, req.body.title, req.body.contributors, req.body.description, req.body.sectors, function(err, data) {
		if (err) return next(err);
		res.status(200).json(data);
	});
});

app.post('/api/addcontributortoproject', function(req, res, next) {
	Database_pg.addContributorToProject(req.body.projectid, req.body.contributorid, function(err, data) {
		if (err) return next(err);
		res.status(200).json(data);
	});
});

app.post('/api/removecontributorfromproject', function(req, res, next) {
	Database_pg.removeContributorFromProject(req.body.projectid, req.body.contributorid, function(err, data) {
		if (err) return next(err);
		res.status(200).json(data);
	});
});

app.post('/api/getprojectbyid', function(req, res, next) {
	Database_pg.getProjectByID(req.body.projectid, function(err, data) {
		if (err) return next(err);
		res.status(200).json(data);
	});
});

app.post('/api/getprojectsbysector', function(req, res, next) {
	Database_pg.getProjectsBySector(req.body.sector, function(err, data) {
		if (err) return next(err);
		res.status(200).json(data);
	});
});

app.get('/api/getallprojects', function(req, res, next) {
	Database_pg.getAllProjects(function(err, data) {
		if (err) return next(err);
		res.status(200).json(data);
	});
});

app.post('/api/deleteproject', function(req, res, next) {
	Database_pg.deleteProject(req.body.projectid, function(err, data) {
		if (err) return next(err);
		res.status(200).json(data);
	});
});

/******************************************************************************
Search APIs
*******************************************************************************/

app.post('/api/searchusers', function(req, res, next) {
	Database_pg.searchUsers(req.body.query, function(err, data) {
		if (err) return next(err);
		res.status(200).json(data)
	});
});

app.post('/api/searchprojects', function(req, res, next) {
	Database_pg.searchProjects(req.body.query, function(err, data) {
		if (err) return next(err);
		res.status(200).json(data)
	});
});
