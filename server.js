var
    app = require('express')(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    clientList = io.sockets.clients('superroom');

server.listen(9999);

app.get('/', function(req, res) {
    res.sendfile('index.html');
});

io.sockets.on('connection', function(socket) {

    socket.join('superroom');

    socket.broadcast.to('superroom').emit('arrived', socket.id);

    console.log(io.sockets.clients('superroom'));

    socket.emit('connected', { clientID: socket.id });

    socket.on('message', function(data) {
        socket.broadcast.to('superroom').emit('onmessage', { client: data.client, message: data.message } );
        console.log('Server: message: ' + data.message);
    });
});

