var
    clientID, clientData = {}, clientArray, chatInitialized = false,
    messageArray = [],
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
////INIT CHAT
//////////////////////////
function initChat() {
    log('initChatScreen');
    initUserSection();
    initChatSection();
    initMessageSection();
}

//////////////////////////
////USER SECTION
//////////////////////////
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

    console.log('clientArray: ' + clientArray);

    for (i = 0; i < clientArray.length; i += 1) {
        userItem = addElement(uList, 'li');
        icon = addElement(userItem, 'i', { className: 'icon-user' });
        userItem.innerHTML += clientArray[i].name;
    }
}

//////////////////////////
////INIT CHAT SECTION
//////////////////////////
function initChatSection() {
    addElement(mainSection, 'section', { id: 'chatSection', className: 'nine columns'});
    addElement(chatSection, 'div', { id: 'chatList'});

    if (messageArray.length > 0) {
        //There are already messages, add them to the board
    }
}

//////////////////////////
////INIT MESSAGE SECTION
//////////////////////////
function initMessageSection() {
    var
        messageSection = addElement(mainSection, 'section', { id: 'messageSection', className: 'twelve columns'}),
        messageContainer = addElement(messageSection, 'div', { className: 'field' });

    addElement(messageContainer, 'textarea', { id: 'messageField', className: 'input textarea', placeholder: 'Say something'});
    addElement(messageSection, 'button', { id: 'sendButton', type: 'button', className: 'pretty medium primary btn send', innerHTML: 'Send'});
}

//////////////////////////
////IOSOCKET
//////////////////////////
iosocket.on('connected', function (data) {
    clientID = data.clientID;
    clientData['id'] = data.clientID;

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
    messageArray = data.messages;

    if (chatInitialized === false) {
        socketLog('initChat');
        initChat();
        chatInitialized = true;
    } else {
        socketLog('refreshUserList');
        refreshUserList();
    }
    socketLog("users joined: " + clientArray.length);
});

iosocket.on('userleft', function (data) {
    clientArray = data.clientList;
    refreshUserList();
    socketLog('User left the room: ' + clientArray);
});

//Constructor
initSocketChat();