var
    clientID, clientData = {}, clientArray, chatInitialized = false,
    iosocket = io.connect('http://localhost:9999'),
    mainSection = document.querySelector("#mainSection"),
    startScreen = document.querySelector("#startScreen"),
    chatNameField = document.querySelector("#chatNameField"),
    chatNameInput = document.querySelector("#chatNameInput"),
    joinButton = document.querySelector("#joinButton"),
    loadingScreen = document.querySelector("#loadingScreen"),
    loadingMessage = document.querySelector("#loadingMessage");

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
    showLoadingScreen('Joining room, one moment...');

    clientData['name'] = name;

    iosocket.emit('join', { data: clientData } );
}

//////////////////////////
////LOADING SCREEN
//////////////////////////
function showLoadingScreen(msg) {
    msg = msg || 'Loading, please wait...';
    loadingScreen.setAttribute('class', 'centered four columns');
    loadingMessage.innerHTML = msg;
    log('showLoadingScreen');
}

function hideLoadingScreen() {
    loadingScreen.setAttribute('class', 'centered four columns hide');
    log('hideLoadingScreen');
}

//////////////////////////
////CHAT
//////////////////////////
function initChat() {
    log('initChatScreen');
    initUserSection();
    initChatSection();
    initMessageSection();
}

function initUserSection() {
    var
        userSection = addElement(mainSection, 'section', { id: 'userSection', className: 'three columns'}),
        userList = addElement(userSection, 'ul', { id: 'userList'});

    refreshUserList();
}

function refreshUserList() {
    var i, userItem, icon, uList = document.querySelector('#userList');

    //clear user list
    uList.innerHTML = '';

    for (i = 0; i < clientArray.length; i += 1) {
        userItem = addElement(uList, 'li');
        icon = addElement(userItem, 'i', { className: 'icon-user' });
        userItem.innerHTML += clientArray[i].data.name;
    }
}

function initChatSection() {
    addElement(mainSection, 'section', { id: 'chatSection', className: 'nine columns'});

}

function initMessageSection() {
    addElement(mainSection, 'section', { id: 'messageSection', className: 'twelve columns'});
}

//////////////////////////
////IOSOCKET
//////////////////////////
iosocket.on('connected', function (data) {
    clientID = data.clientID;
    clientData['id'] = data.clientID;

    //idField.innerHTML = "Your client ID is: " + clientID;
    socketLog('your ID is: ' + clientID);
    socketLog('connected');
});

iosocket.on('onmessage', function (data) {
    socketLog("Message received: " + data.message);
    //addToMessageBoard(data.client, data.message);
});

iosocket.on('joined', function (data) {
    hideLoadingScreen();
    clientArray = data.clientList;
    //socketLog("clientArray: " + clientArray);

    if (chatInitialized === false) {
        initChat();
        chatInitialized = true;
    } else {
        refreshUserList();
    }
    socketLog("users joined: " + clientArray.length);
});

iosocket.on('close', function () {
    socketLog('Connection close');
});

//Constructor
initSocketChat();