var iosocket = io.connect('http://localhost:9999');

iosocket.on('connected', function (data) {
    clientID = data.clientID;
    //idField.innerHTML = "Your client ID is: " + clientID;
    console.log('Connected');
    //logInDebug('Connected');
});

iosocket.on('onmessage', function (data) {
    console.log('Message received: ' + data.message);
    //addToMessageBoard(data.client, data.message);
});

iosocket.on('arrived', function (data) {
    console.log(data + ' has arrived!');
    //logInDebug(data + ' has arrived!');
});

iosocket.on('close', function () {
    console.log('Connection close');
});