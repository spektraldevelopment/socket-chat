var
    app = require('express')(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    clientList = io.sockets.clients('superroom'),
    clientArray = [];

server.listen(9999);

app.get('/', function(req, res) {
    res.sendfile('index.html');
});

io.sockets.on('connection', function(socket) {

//    socket.join('superroom');
//
//    socket.broadcast.to('superroom').emit('arrived', socket.id);
//
//    console.log('CLIENTS:!!!!!!!')
//    console.log(io.sockets.clients('superroom').length);

    socket.emit('connected', { clientID: socket.id });

    socket.on('join', function(data) {
        console.log('joined: ' + JSON.stringify(data));
        socket.join('superroom');
        clientArray.push(data);
        //emit to all users including sender
        socket.to('superroom').emit('joined', { clientList: clientArray });
        socket.broadcast.to('superroom').emit('joined', { clientList: clientArray });
    });

    socket.on('message', function(data) {
        //send message to everyone except sender
        socket.broadcast.to('superroom').emit('onmessage', { client: data.client, message: data.message } );
        console.log('Server: message: ' + data.message);
    });
});


