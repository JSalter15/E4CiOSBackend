var express = require('express')
var app = express()

var Database = require('./database.js');

app.listen(8080);

// Database.createUser('Joe', 'Salter', 'joe@joe.joe', 'pw', 'engineer', 'prof', 'USA', 12, 'M', "['Water', 'Engery']", function(err, res) {
// 	if (err) {
// 		console.log(err);
// 	}
// 	else
// 		console.log(res)
// });

/******************************************************************************
Account APIs
*******************************************************************************/

// app.post('/api/login', function(req, res, next) {

// });

app.post('/api/createaccount', function(req, res, next) {
	let firstname = req.body.firstName;
	let lastname = req.body.lastName;
	let email = req.body.email;
	let password = req.body.password;
	let profstatus = req.body.profstatus;
	let affiliation = req.body.affiliation;
	let country = req.body.country;
	let age = req.body.age;
	let gender = req.body.gender;
	let expertise = req.body.expertise;

	Database.createUser(firstname, lastname, lastname, email, password, profstatus, affiliation, country, age, gender, expertise, function(err, data) {
		if err return next(err);
		res.status(200).json({uuid: data, firstname: firstname, lastname: lastname, email: email});
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


// *****************************************************************************
// Project APIs
// ******************************************************************************

// app.post('/api/createproject', function(req, res, next) {

// });

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
