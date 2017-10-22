var http = require("http");
var express = require("express");

var app = express();
var server = app.listen(3000);

var io = require('socket.io').listen(server);

var path = __dirname + '/views/';

// Express CORS setup
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

// Express routes
app.set("view engine", "vash");

app.get("/",function(req, res){
  res.render("index");
});

// Socket.io operations
io.on('connection', function(socket){
  console.log('a user connected');
});