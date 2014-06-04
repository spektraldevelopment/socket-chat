var
    app = require('express')(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    clientArray = [], messageArray =[], clientList;

server.listen(9999);

app.get('/', function(req, res) {
    res.sendfile('index.html');
});

io.sockets.on('connection', function(socket) {

    socket.emit('connected', { clientID: socket.id });

    socket.on('join', function(data) {
        console.log('joined: ' + data.data.name);
        socket.userData = data.data;
        socket.join('superroom');

        //emit to all users including sender
        socket.to('superroom').emit('joined', { clientList: getClientList(), messages: messageArray });
        socket.broadcast.to('superroom').emit('joined', { clientList: clientArray, messages: messageArray });
    });

    socket.on('message', function(data) {
        //send message to everyone except sender
        messageArray.push(data);
        socket.broadcast.to('superroom').emit('onmessage', { client: data.client, message: data.message } );
        console.log('Server: message: ' + data.message);
    });

    socket.on('disconnect', function(data) {

        console.log('User disconnected');
        socket.leave('superroom');
        socket.broadcast.to('superroom').emit('userleft', { clientList: getClientList() });
    });

    function getClientList() {
        clientList = io.sockets.clients('superroom');

        //Clear array and refresh it
        clientArray = [];
        clientList.forEach(function(client) {
            clientArray.push(client.userData);
        });
        console.log('getClientList: ' + clientArray);
        return clientArray;
    }
});


