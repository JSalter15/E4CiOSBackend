var express = require('express')
var app = express()

var Database = require('./Database.js');

app.listen(8080);


/******************************************************************************
Account APIs
*******************************************************************************/

app.post('/api/login', function(req, res, next) {

});

app.post('/api/createaccount', function(req, res, next) {

});

app.post('/api/editaccount', function(req, res, next) {

});

app.post('/api/deleteaccount', function(req, res, next) {

});

app.post('/api/getuser', function(req, res, next) {

});

/******************************************************************************
News APIs
*******************************************************************************/


/******************************************************************************
Webinars APIs
*******************************************************************************/


/******************************************************************************
Project APIs
*******************************************************************************/

app.post('/api/createproject', function(req, res, next) {

});

app.post('/api/editproject', function(req, res, next) {

});

app.post('/api/deleteproject', function(req, res, next) {

});

/******************************************************************************
Search APIs
*******************************************************************************/

app.post('/api/searchusers', function(req, res, next) {

});

app.post('/api/searchprojects', function(req, res, next) {

});
