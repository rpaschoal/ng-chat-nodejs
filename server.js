var http = require("http");
var path = require("path");
var express = require("express");
var bodyParser = require('body-parser');
var formidable = require('formidable');
var fs = require('fs');

var app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

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

var server = app.listen(3000);

var io = require('socket.io').listen(server);

//var path = __dirname + '/views/';

var usersCollection = [];

// Express routes
app.set("view engine", "vash");

app.use("/Uploads", express.static(path.join(__dirname, 'Uploads')));

app.get("*",function(req, res){
  res.render("index");
});

app.post("/listFriends",function(req, res){
  var clonedArray = usersCollection.slice();

  // Getting the userId from the request body as this is just a demo 
  // Ideally in a production application you would change this to a session value or something else
  var i = usersCollection.findIndex(x => x.participant.id == req.body.userId);

  clonedArray.splice(i,1);

  res.json(clonedArray);
});

app.post('/uploadFile', function (req, res){
  let form = new formidable.IncomingForm();
  let ngChatDestinataryUserId;

  if (!fs.existsSync("/Uploads")){
    fs.mkdirSync("/Uploads");
  }
  
  form.parse(req)
  .on('field', function (name, field) {
    // You must always validate this with your backend logic
    if (name === 'ng-chat-participant-id')
      ngChatDestinataryUserId = field;
  })
  .on('fileBegin', function (name, file){
      file.path = `${__dirname}/Uploads/${file.name}`;
  })
  .on('file', function (name, file){
    console.log('Uploaded ' + file.name);

    // Push socket IO status
    let message = {
      type: 2, // MessageType.File = 2
      //fromId: ngChatSenderUserId, fromId will be set by the angular component after receiving the http response
      toId: ngChatDestinataryUserId,
      message: file.name,
      mimeType: file.type,
      fileSizeInBytes: file.size,
      downloadUrl:  `http://localhost:3000/Uploads/${file.name}`
    };

    console.log("Returning file message:");
    console.log(message);

    res.status(200);
    res.json(message);
  });
});

// Socket.io operations
io.on('connection', function(socket){
  console.log('A user has connected to the server.');

  socket.on('join', function(username) {
    // Same contract as ng-chat.User
    usersCollection.push({
        participant: {
            id: socket.id, // Assigning the socket ID as the user ID in this example
            displayName: username,
            status: 0, // ng-chat UserStatus.Online,
            avatar: null
        }
    });

    socket.broadcast.emit("friendsListChanged", usersCollection);

    console.log(username + " has joined the chat room.");

    // This is the user's unique ID to be used on ng-chat as the connected user.
    socket.emit("generatedUserId", socket.id);

    // On disconnect remove this socket client from the users collection
    socket.on('disconnect', function() {
      console.log('User disconnected!');

      var i = usersCollection.findIndex(x => x.participant.id == socket.id);
      usersCollection.splice(i, 1);

      socket.broadcast.emit("friendsListChanged", usersCollection);
   });
  });

  socket.on("sendMessage", function(message){
    console.log("Message received:");
    console.log(message);

    console.log(usersCollection.find(x => x.participant.id == message.fromId));

    io.to(message.toId).emit("messageReceived", {
      user: usersCollection.find(x => x.participant.id == message.fromId).participant,
      message: message
    });

    console.log("Message dispatched.");
  });
});
