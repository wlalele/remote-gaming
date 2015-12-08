// Constants
var PORT = 8080;

// Libs Initialization
var http = require('http'),
    robot = require('robotjs');

// HTTP Server
var server = http.createServer(function (res) {
    'use strict';
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello World\n');
}).listen(PORT);

var io = require('socket.io').listen(server),
    state = null;

io.sockets.on('connection', function (socket) {
    'use strict';

    // Server log connection of user
    console.log('a user connected');

    // Server log disconnection of user
    socket.on('disconnect', function() {
        console.log('a user disconnected');
    });

    socket.on('update_controller', function (controller_state) {
        state = controller_state;

        if (state.buttons[0] === true) {
            console.log('X'); // log into term where server is launched
            robot.typeString("X"); // simulate string typing
        }
    });
});
