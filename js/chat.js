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
    loadingMessage = document.querySelector("#loadingMessage"),
    chatSection, chatList, alertSection, typingIcon, typingUser,
    messageFieldFocused = false;

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
    var i, userItem, uList = document.querySelector('#userList'), localUser;

    //clear user list
    uList.innerHTML = '';

    console.log('clientArray: ' + clientArray);

    for (i = 0; i < clientArray.length; i += 1) {
        userItem = addElement(uList, 'li', { id: "user-" + clientArray[i].id });
        userItem.setAttribute('data-username', clientArray[i].name );
        addElement(userItem, 'i', { className: 'icon-user' });
        userItem.innerHTML += clientArray[i].name;
        addElement(userItem, 'i', { className: 'icon-pencil hide'});
    }

    localUser = uList.querySelector('#user-' + clientData.id);
    typingIcon = localUser.querySelector('.icon-pencil');
}

//////////////////////////
////INIT CHAT SECTION
//////////////////////////
function initChatSection() {
    var i;
    chatSection = addElement(mainSection, 'section', { id: 'chatSection'});
    chatList = addElement(chatSection, 'ul', { id: 'chatList'});

    if (messageArray.length > 0) {
        //There are already messages, add them to the board
        for (i = 0; i < messageArray.length; i += 1) {
            addToChatList(messageArray[i].client, messageArray[i].message);
        }
    }
}

function addToChatList(client, msg) {
    var item = addElement(chatList, 'li', { className: 'chatItem' });

    addElement(item, 'div', { className: 'chatName', innerHTML: client });
    addElement(item, 'div', { className: 'chatMessage', innerHTML: msg });
    addElement(item, 'div', { className: 'chatTime', innerHTML: '8:00pm' });

    chatSection.scrollTop = chatSection.scrollHeight;
}

//////////////////////////
////INIT MESSAGE SECTION
//////////////////////////
function initMessageSection() {
    var
        messageSection = addElement(mainSection, 'section', { id: 'messageSection', className: 'twelve columns'}),
        messageContainer = addElement(messageSection, 'div', { className: 'field' }),
        messageField =  addElement(messageContainer, 'textarea', { id: 'messageField', className: 'input textarea', placeholder: 'Say something'}),
        sendButton = addElement(messageSection, 'button', { id: 'sendButton', type: 'button', className: 'pretty medium primary btn send', innerHTML: 'Send'}),
        userListItem = document.querySelector('#user-' + clientData.id);

    attachEventListener(sendButton, 'click', function(evt) {
        addToChatList(clientData.name, messageField.value);
        iosocket.emit('message', { client: clientData.name, message: messageField.value });
    });

    attachEventListener(messageField, 'keydown', function(evt) {
        //If key down, clear typingTimeout
        elementShow(typingIcon);
        iosocket.emit('keydown', { data: clientData } );

        if (evt.keyCode === 13) {
            evt.preventDefault();
            addToChatList(clientData.name, messageField.value);
            iosocket.emit('message', { client: clientData.name, message: messageField.value });
        }
    });

    attachEventListener(messageField, 'keyup', function(evt) {
        //If using is no longer typing, remove pencil icon
        elementHide(typingIcon);
        iosocket.emit('keyup', { data: clientData } );
    });
}

//////////////////////////
////INIT ALERT SECTION
//////////////////////////
function initAlertSection() {
    alertSection = addElement(mainSection, 'section', { id: 'alertSection', className: 'row' });
}

function addAlert(msg) {
    addElement(alertSection, 'p', { id: 'alertField', className: 'primary alert', innerHTML: msg });
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
    addToChatList(data.client, data.message);
});

iosocket.on('onkeydown', function(data) {
    //socketLog('On keydown: data.name: ' + data.clientData.data.name);
    typingUser = document.querySelector('#user-' + data.clientData.data.id).querySelector('.icon-pencil');
    elementShow(typingUser);
});

iosocket.on('onkeyup', function(data) {
    //socketLog('On keyup: data.name: ' + data.clientData.data.name);
    typingUser = document.querySelector('#user-' + data.clientData.data.id).querySelector('.icon-pencil');;
    elementHide(typingUser);
});

iosocket.on('joined', function (data) {
    socketLog('New client has joined: ' + data.newClient);

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