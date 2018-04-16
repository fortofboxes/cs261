// Load Environment Variables from .env file
require('dotenv').config();
let httpPort    = 8124 //process.env.NODE_PORT; TODO
let logLevel    = process.env.NODE_LOG_LEVEL;
let udpPort     = 8124//process.env.UDP_PORT;

const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const jsonUtils = require('./utils/json');
const users = require('./routes/users');
const replication = require('./replicationServer/dumbClientReplication');

const app = express();

app.use(logger(logLevel));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(jsonUtils.requestMiddleware);
app.use(jsonUtils.responseMiddleware);

const httpServer = app.listen(httpPort, (err) => {
  console.log("Node app " + __filename + " is listeni	ng on HTTP port " + httpPort + "!");
});

const udpServer = replication.listen(udpPort, (err) => {
    console.log("Node app " + __filename + " is listening on UDP port " + udpPort + "!");
});

module.exports = app;
