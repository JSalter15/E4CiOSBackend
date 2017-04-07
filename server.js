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
	let country = req.body.country;
	let age = req.body.age;
	let gender = req.body.gender;
	let expertise = req.body.expertise;

	Database.createUser(firstname, lastname, email, password, profstatus, affiliation, country, age, gender, expertise, function(err, data) {
		if (err) return next(err);
		res.status(200).json({uuid:data, firstname:firstname, lastname:lastname});
	});
});

// app.post('/api/editaccount', function(req, res, next) {

// });

// app.post('/api/deleteaccount', function(req, res, next) {

// });

// app.post('/api/getuser', function(req, res, next) {

// });

// /******************************************************************************
// News APIs
// *******************************************************************************/


// /******************************************************************************
// Webinars APIs
// *******************************************************************************/


// /*****************************************************************************
// Project APIs
// ******************************************************************************/

app.post('/api/createproject', function(req, res, next) {
	Database.createProject(req.body.title, req.body.author, req.body.description, function(err, data) {
		if (err) return next(err);
		res.status(200).json(data);
	});
});

// app.post('/api/editproject', function(req, res, next) {

// });

// app.post('/api/deleteproject', function(req, res, next) {

// });

// /******************************************************************************
// Search APIs
// *******************************************************************************/

// app.post('/api/searchusers', function(req, res, next) {

// });

// app.post('/api/searchprojects', function(req, res, next) {

// });
