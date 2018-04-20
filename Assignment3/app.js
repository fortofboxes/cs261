// main file for the nodejs app

var express = require('express');   // express server
var redis   = require('redis');     // redis used for sessions 

var app = express();                // init express
var redisClient = redis.createClient(); 
redisClient.on('connect', function() {
    app.listen(6379); // does this need to be 8123
});

// BASICALLY JUST NEED to have session information stored in redis?

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
