var express = require('express')
var app = express()
var Database = require('./database.js');
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
	Database.validateUser(req.body.email, req.body.password, function(err, data) {
		if (err) return next(err);
		res.status(200).json(data);
	});
});

app.post('/api/createaccount', function(req, res, next) {
	let firstname = req.body.firstname;
	let lastname = req.body.lastname;
	let email = req.body.email;
	let password = req.body.password;
	let profstatus = req.body.profstatus;
	let affiliation = req.body.affiliation;
	let expertise = req.body.expertise;
	let country = req.body.country;
	let age = req.body.age;
	let gender = req.body.gender;
	let sectors = req.body.sectors;
	

	Database.createAccount(firstname, lastname, email, password, profstatus, affiliation, expertise, country, age, gender, sectors, function(err, data) {
		if (err) return next(err);
		res.status(200).json({id:data, firstname:firstname, lastname:lastname});
	});
});

// app.post('/api/editaccount', function(req, res, next) {

// });

app.post('/api/deleteaccount', function(req, res, next) {
	Database.deleteAccount(req.body.id, function(err, data) {
		if (err) return next(err);
		res.status(200).json({message:"success"});
	})
});

app.post('/api/getuserbyid', function(req, res, next) {
	Database.getUserByID(req.body.userid, function(err, data) {
		if (err) return next(err);
		res.status(200).json(data);
	})
});

/******************************************************************************
News APIs
*******************************************************************************/


/******************************************************************************
Webinars APIs
*******************************************************************************/


/*****************************************************************************
Project APIs
******************************************************************************/

app.post('/api/createproject', function(req, res, next) {
	Database.createProject(req.body.owner, req.body.title, req.body.contributors, req.body.description, req.body.sectors, function(err, data) {
		if (err) return next(err);
		res.status(200).json(data);
	});
});

app.post('/api/addcontributortoproject', function(req, res, next) {
	Database.addContributorToProject(req.body.projectid, req.body.contributorid, function(err, data) {
		if (err) return next(err);
		res.status(200).json(data);
	});
});

app.post('/api/removecontributorfromproject', function(req, res, next) {
	Database.removeContributorFromProject(req.body.projectid, req.body.contributorid, function(err, data) {
		if (err) return next(err);
		res.status(200).json(data);
	});
});

app.post('/api/getprojectbyid', function(req, res, next) {
	Database.getProjectByID(req.body.projectid, function(err, data) {
		if (err) return next(err);
		res.status(200).json(data);
	});
});

app.post('/api/getprojectsbysector', function(req, res, next) {
	Database.getProjectsBySector(req.body.sector, function(err, data) {
		if (err) return next(err);
		res.status(200).json(data);
	});
});

app.get('/api/getallprojects', function(req, res, next) {
	Database.getAllProjects(function(err, data) {
		if (err) return next(err);
		res.status(200).json(data);
	});
});

app.post('/api/deleteproject', function(req, res, next) {
	Database.deleteProject(req.body.projectid, function(err, data) {
		if (err) return next(err);
		res.status(200).json(data);
	});
});

/******************************************************************************
Search APIs
*******************************************************************************/

app.post('/api/searchusers', function(req, res, next) {
	Database.searchUsers(req.body.query, req.body.user, function(err, data) {
		if (err) return next(err);
		res.status(200).json(data)
	});
});

app.post('/api/searchprojects', function(req, res, next) {
	Database.searchProjects(req.body.query, function(err, data) {
		if (err) return next(err);
		res.status(200).json(data)
	});
});
