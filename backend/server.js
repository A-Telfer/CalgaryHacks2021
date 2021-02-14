const express = require('express');
const app = express();
const http = require('http').Server(app);
const fs = require('fs');
const spawn = require("child_process").spawn;

const io = require('socket.io')(http, {
  cors: {
    origin: '*',
  }});

const user_emotions = {}

// No CORS error
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(express.static('public'))

app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/tolatex', (req, res) => {
  var base64Data = req.body.photo.replace(/^data:image\/png;base64,/, "");
  console.log(base64Data)
  require("fs").writeFile("out.png", base64Data, 'base64', function(err) {
    console.log(err);
    
    let pythonProcess = spawn('python',["path/to/script.py", arg1, arg2, ...]);
    res.send('ok!')
  });
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.emit('test', 'Message from server')

  socket.on('emotion', (msg) => {
    console.log('message: ' + msg);
    console.log(socket.id);
    user_emotions[socket.id] = JSON.parse(msg);
    let emotion_data = Object.values(user_emotions);
    socket.emit('emotion', JSON.stringify(emotion_data));
  });

  socket.on('disconnect', () =>{
    console.log('disconnected')
    delete user_emotions[socket.id]
  })

  socket.on('canvas-data', (data)=> {
    socket.broadcast.emit('canvas-data', data);  
  })
});

http.listen(3001, () => {
  console.log('listening on *:3001');
});