// Constants
var PORT = 8080;
var TIMEOUT = 5000;

// Initialization
var http = require('http');

var server = http.createServer(function (res) {
    'use strict';
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello World\n');
}).listen(PORT);

var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
    'use strict';
    // Broadcast a message to every user
    // socket.broadcast.emit('hi & welcome');

    // Server log connection of user
    console.log('a user connected');

    // Server log disconnection of user
    socket.on('disconnect', function() {
        console.log('a user disconnected');
    });

    socket.emit('connection', new_player);

    // When a chat message is sent, broadcast it to every user
    socket.on('message', function(msg) {
        io.sockets.emit('message', msg);
    });

    socket.on('update', function (datas) {

    });
});

setInterval(function () {
    'use strict';
    io.sockets.emit('playersUpdate');
}, 50);