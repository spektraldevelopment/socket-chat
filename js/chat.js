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
    imageCanvas = document.createElement('canvas'),
    imageCanvasCTX = imageCanvas.getContext('2d');

//////////////////////////
////INIT
//////////////////////////
function initSocketChat() {

    attachEventListener(joinButton, 'click', onJoinClick);
    attachEventListener(chatNameInput, 'focus', onInputFocus);
    mainSection.appendChild(imageCanvas);
    imageCanvas.setAttribute('style', 'display:none');
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
            addToChatList(messageArray[i].client, messageArray[i].message, messageArray[i].messageType);
        }
    }
}

function addToChatList(client, msg, type) {
    log('client: ' + client);
    log('msg: ' + msg);
    log('type: ' + type);
    type = type || 'text';
    var item = addElement(chatList, 'li', { className: 'chatItem' }), cImage, preview, state, imageContainer;

    addElement(item, 'div', { className: 'chatName', innerHTML: client });

    if (type === 'image') {
        imageContainer = addElement(item, 'div', { className: 'image-container'});
        cImage = addElement(imageContainer, 'img', { className: 'chatImage', src: msg});
        if (getImageType(msg) === 'gif') {
            //If image is animated, create preview
            cImage.setAttribute('data-state', 'preview');
            preview = createImagePreview(cImage);
            cImage.src = preview;
            attachEventListener(cImage, 'click', function(evt) {
                state = cImage.getAttribute('data-state');
                if (state === 'preview') {
                    cImage.setAttribute('data-state', 'animated');
                    cImage.src = msg;

                } else {
                    cImage.setAttribute('data-state', 'preview');
                    cImage.src = preview;
                }
            });
        } else {
            //Image is not animated
            cImage.src = msg;
        }
    } else {
        addElement(item, 'div', { className: 'chatMessage', innerHTML: msg });
    }
    addElement(item, 'div', { className: 'chatTime', innerHTML: getTime()});

    chatSection.scrollTop = chatSection.scrollHeight;
}

function addImageToChat(files) {
    var newFile, reader, bin, i;

    for (i = 0; i < files.length; i += 1) {
        newFile = files[i];

        reader = new FileReader();
        reader.readAsDataURL(newFile);

        attachEventListener(reader, 'loadend', function(evt, file) {
            bin = this.result;

            addToChatList(clientData.name, bin, 'image');
            emitMessage(bin, 'image');
        });
    }
}

function createImagePreview(sourceImage) {

    var size = 50;
    imageCanvas.width = sourceImage.width;
    imageCanvas.height = sourceImage.height;
    imageCanvasCTX.drawImage(sourceImage, 0, 0, imageCanvas.width, imageCanvas.height);

    imageCanvasCTX.fillStyle = 'rgba(0, 0, 0, 0.75)';
    imageCanvasCTX.fillRect(0 ,0, sourceImage.width, sourceImage.height);

    imageCanvasCTX.beginPath();

    imageCanvasCTX.moveTo((sourceImage.width / 2) - size, (sourceImage.height / 2) - size);
    imageCanvasCTX.lineTo((sourceImage.width /2 ) + size, sourceImage.height / 2);
    imageCanvasCTX.lineTo((sourceImage.width / 2) - size, (sourceImage.height / 2) + size);

    imageCanvasCTX.lineWidth = 2;
    imageCanvasCTX.fillStyle = "rgba(48, 133, 214, 0.75)";
    imageCanvasCTX.strokeStyle = "rgb(255, 255, 255)";
    imageCanvasCTX.closePath();

    imageCanvasCTX.fill();
    imageCanvasCTX.stroke();

    return imageCanvas.toDataURL('image/jpeg');
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
        uploadPicture = addElement(messageSection, 'button', { id: 'uploadPicture', type: 'button', className: 'pretty medium primary btn'}),
        picIcon = addElement(uploadPicture, 'i', { className: 'icon-picture'}),
        fileInput = addElement(uploadPicture, 'input', { id: 'fileInput', type: 'file'});

    attachEventListener(sendButton, 'click', function(evt) {
        if (messageField.value !== '') {
            addToChatList(clientData.name, messageField.value);
            emitMessage(messageField.value);
        }
    });

    attachEventListener(uploadPicture, 'click', function(evt) {
        fileInput.click();
    });

    attachEventListener(fileInput, 'change', function(evt) {
        addImageToChat(fileInput.files);
    });

    attachEventListener(messageField, 'keydown', function(evt) {
        //If key down, clear typingTimeout
        elementShow(typingIcon);
        iosocket.emit('keydown', { data: clientData } );

        if (evt.keyCode === 13 && messageField.value !== '') {
            evt.preventDefault();
            addToChatList(clientData.name, messageField.value);
            emitMessage(messageField.value);
        }
    });

    attachEventListener(messageField, 'keyup', function(evt) {
        //If using is no longer typing, remove pencil icon
        elementHide(typingIcon);
        iosocket.emit('keyup', { data: clientData } );
    });

    attachEventListener(messageField, 'drop', function(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        var
            dt = evt.dataTransfer,
            files = dt.files;

        addImageToChat(files);
    });
}

function emitMessage(msg, type) {
    type = type || 'text';
    log('emitMessage: type: ' + type)
    iosocket.emit('message', { client: clientData.name, message: msg, messageType: type });
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
    addToChatList(data.client, data.message, data.messageType);
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