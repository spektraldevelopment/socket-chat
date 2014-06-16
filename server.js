var
    app = require('express')(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    socketioVersion = require('socket.io').version,
    clientArray = [], messageArray =[], clientList;

server.listen(9999);

app.get('/', function(req, res) {
    res.sendfile('index.html');
});

io.sockets.on('connection', function(socket) {

    socket.emit('connected', { clientID: socket.id });

    socket.on('join', function(data) {
        console.log('Server: joined: ' + data.data.name);
        socket.userData = data.data;
        socket.join('superroom');

        //emit to all users including sender
        io.to('superroom').emit('joined', { newClient: data.data.name, clientList: getClientList(), messages: messageArray});

    });

    socket.on('message', function(data) {
        //send message to everyone except sender
        messageArray.push(data);
        socket.broadcast.to('superroom').emit('onmessage', { client: data.client, message: data.message } );
        console.log('Server: message: ' + data.message);
    });

    socket.on('keydown', function(data) {
        socket.broadcast.to('superroom').emit('onkeydown', { clientData: data } );
        //console.log('Server: keydown');
    });

    socket.on('keyup', function(data) {
        socket.broadcast.to('superroom').emit('onkeyup', { clientData: data } );
        //console.log('Server: keyup');
    });

    socket.on('disconnect', function(data) {
        console.log('Server: User disconnected');
        socket.leave('superroom');
        socket.broadcast.to('superroom').emit('userleft', { clientList: getClientList() });
    });

    function getClientList() {
        clientList = io.sockets.adapter.rooms['superroom'];
        //Clear array and refresh it
        clientArray = [];
        for (var clientId in clientList) {
            clientArray.push(io.sockets.connected[clientId].userData);
        }
        return clientArray;
    }
});


