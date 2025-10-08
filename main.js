const express = require('express');
const app = express();
const path = require('path');
const FileSaver = require('file-saver');
const fs = require('fs');

const http = require('http').Server(app)

const port = process.env.PORT || 5000;

// attach http server to the socket.io

const io = require('socket.io')(http);

let counterFile = 0;

// create a new connection
io.on('connection', socket => {
    console.log(`A User Connected with ID = ${socket.id}`);

    socket.on("message", msg => {
        console.log("Client send " + msg);
    })

    //emit event
    socket.emit("server", "recieve from server");

    const users = {};

    socket.on('new-user', name => {
        users[socket.id] = name;
        socket.broadcast.emit('user-connected', name);
    })

    socket.on('time-connect', time => {
        console.log(`connected at ${time}`);
    })

    socket.on('send-chat-message', message => {
        socket.broadcast.emit('chat-message', {message:message, name:users[socket.id]});
        console.log(`${users[socket.id]}: ${message}`);
    })

    socket.on('send-time', time => {
        console.log(`send at ${time}`);
    })

    socket.on('disconnect', () => {
        socket.broadcast.emit('user-disconnected', users[socket.id]);
        console.log(`User ${users[socket.id]} with ID (${socket.id}) disconnected`);
        delete users[socket.id];
    })

    socket.on('time-disconnect', time => {
        console.log(`disconnect at ${time}`);
    })

    socket.on('typing', (name) => {
        socket.broadcast.emit('typing', name);
    })

    socket.on('send-vn', voiceData => {
        socket.broadcast.emit("vn", {voiceData:voiceData, name:users[socket.id]});
        // console.log(`${users[socket.id]}: ${voiceData}`);

        fs.appendFile("./Audio/Audio" + users[socket.id] + (counterFile++) + ".txt", voiceData, function(err) {
            if(err) {
                return console.log(err);
            }

            console.log("Audio File Was Recieved!!");
        });
    })

    socket.on('vn-record', name => {
        socket.broadcast.emit('record-vn', name);
    })

    socket.on('send-file', fileData => {
        socket.broadcast.emit("file-sending", {fileData:fileData, name:users[socket.id]});
        // console.log(fileData);

        fs.appendFile("./Images/Image" + users[socket.id] + (counterFile++) + ".txt", fileData, function(err) {
            if(err) {
                return console.log(err);
            }

            console.log("Image File Was Recieved!!");
        });
    })
})


app.use(function (request, result, next){
    result.setHeader("Access-Control-Allow-Origin", "*");
    next();
})

// route 
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "src/index.html"));
})

app.get('/get-style', (req, res) => {
    res.sendFile(path.join(__dirname, "src/style.css"));
})

app.get('/get-script', (req, res) => {
    res.sendFile(path.join(__dirname, "src/script.js"));
})

http.listen(port, "0.0.0.0", () => {
    console.log(`App Listening on port ${port}`)
})
