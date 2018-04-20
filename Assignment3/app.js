// main file for the nodejs app

var express = require('express');   // express server
var redis   = require('redis');     // redis used for sessions 
var mysql   = require('mysql');

var app = express();                // init express
var redisClient = redis.createClient(); 
var connection = mysql.createConnection({
           host: 'ec2-34-215-240-221.us-west-2.compute.amazonaws.com', // private ip?
           user: 'cs261-app',
           password: 'pickagoodpassword',
           database: 'massteroids'
          });

exports.GetSQLConnection = () => {
	return connection;
}

exports.GetRedisClient =() => {
	return redisClient;
}

const bodyParser 	 = require('body-parser');
app.use(bodyParser.json())

let users = require('./user.js'); // user route

// defines the root route for the server end api
let apiRoot = "/api/v1/";  

// calls register function in route_user.js to register the other URL routes
users.register(app, apiRoot + "users/");

app.get(apiRoot, function(req, res) {
	res.send('Hello world!');	
});

let server = app.listen(8123);
console.log("listening");
