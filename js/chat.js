var
    clientID, clientData = {}, clientList,
    iosocket = io.connect('http://localhost:9999'),
    startScreen = document.querySelector("#startScreen"),
    chatNameField = document.querySelector("#chatNameField"),
    chatNameInput = document.querySelector("#chatNameInput"),
    joinButton = document.querySelector("#joinButton"),
    loadingScreen = document.querySelector("#loadingScreen");

//////////////////////////
////INIT
//////////////////////////
function initSocketChat() {

    attachEventListener(joinButton, 'click', onJoinClick);
    attachEventListener(chatNameInput, 'focus', onInputFocus);
    log("initSocketChat");
}

//////////////////////////
////START SCREEN
//////////////////////////
function onJoinClick (evt) {
    var chatName = chatNameInput.value;
    if (chatName === '') {
        //Must enter a name
        chatNameField.setAttribute('class', 'field nine columns danger');
        chatNameInput.setAttribute('class', 'input inputError');
    } else {
        //Submit name
        chatNameField.setAttribute('class', 'field nine columns');
        chatNameInput.setAttribute('class', 'input');
        submitUserName(chatName);
    }
   log("chatName: " + chatName);
}

function onInputFocus(evt) {
    chatNameField.setAttribute('class', 'field nine columns');
    chatNameInput.setAttribute('class', 'input');
}

function submitUserName(name) {
    removeElement(startScreen);
    showLoadingScreen();

    clientData['name'] = name;
}

function showLoadingScreen() {
    loadingScreen.setAttribute('class', 'centered four columns');
    log('showLoadingScreen');
}

function hideLoadingScreen() {
    loadingScreen.setAttribute('class', 'centered four columns hide');
    log('hideLoadingScreen');
}

//////////////////////////
////IOSOCKET
//////////////////////////
iosocket.on('connected', function (data) {
    clientID = data.clientID;
    clientData['id'] = data.clientID;

    clientList = data.list;
    //idField.innerHTML = "Your client ID is: " + clientID;
    socketLog('ID: ' + clientID);
    socketLog('Connected: ' + clientList);
});

iosocket.on('onmessage', function (data) {
    socketLog("Message received: " + data.message);
    //addToMessageBoard(data.client, data.message);
});

iosocket.on('arrived', function (data) {
    socketLog(data + " has arrived!");
});

iosocket.on('close', function () {
    socketLog('Connection close');
});

//Constructor
initSocketChat();