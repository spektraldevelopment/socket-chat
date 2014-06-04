// Gumby is ready to go
Gumby.ready(function() {
	Gumby.log('Gumby is ready to go...', Gumby.dump());

	// placeholder polyfil
	if(Gumby.isOldie || Gumby.$dom.find('html').hasClass('ie9')) {
		$('input, textarea').placeholder();
	}

	// skip link and toggle on one element
	// when the skip link completes, trigger the switch
	$('#skip-switch').on('gumby.onComplete', function() {
		$(this).trigger('gumby.trigger');
	});

// Oldie document loaded
}).oldie(function() {
	Gumby.warn("This is an oldie browser...");

// Touch devices loaded
}).touch(function() {
	Gumby.log("This is a touch enabled device...");
});

///////////////////////////
////UTILS
///////////////////////////

//////////////////
////ATTACH EVENT LISTENER
/////////////////
function attachEventListener(eventTarget, eventType, eventHandler) {
    if (eventTarget.addEventListener) {
        eventTarget.addEventListener(eventType, eventHandler, false);
    } else if (eventTarget.attachEvent) {
        eventType = "on" + eventType;
        eventTarget.attachEvent(eventType, eventHandler);
    } else {
        eventTarget["on" + eventType] = eventHandler;
    }
}

//////////////////
////ADD ELEMENT
/////////////////
function addElement(parent, type, attrs) {

    var newElement = document.createElement(type), key;
    for (key in attrs) {
        if (key === 'className') {
            newElement.setAttribute('class', attrs[key]);
        } else if (key === 'innerHTML') {
            newElement.innerHTML = attrs[key];
        } else {
            newElement.setAttribute(key, attrs[key]);
        }
    }
    parent.appendChild(newElement);
    return newElement;
}

//////////////////
////REMOVE ELEMENT
/////////////////
function removeElement (element) {
    try {
        element.remove();
    } catch (err) {
        element.parentNode.removeChild(element);
    }
}

////////////////////
////GET PARAMETER
////////////////////
function getParameter (obj, val, defaultParam) {
    var retrievedParam;
    if (obj !== undefined) {
        if (obj[val] === undefined) {
            retrievedParam = defaultParam;
            //console.log("getParameter: val was not found, setting to default.")
        } else {
            retrievedParam = obj[val];
            //console.log("getParameter: val found.")
        }
    } else {
        retrievedParam = defaultParam;
        //console.log("getParameter: object was not defined, setting val to default.")
    }
    return retrievedParam;
}

//////////////////
////GET STYLE
//////////////////
function getStyle(element, styleProperty) {

    styleProperty = styleProperty || undefined;
    var style;
    if(styleProperty !== undefined) {
        try {
            style = element.currentStyle[styleProperty];
        } catch (err) {
            style = document.defaultView.getComputedStyle(element, null).getPropertyValue(styleProperty);
        }
    }
    return style;
}

//////////////////
////STRING TO NUM
//////////////////
function stringToNum(str) {
    return parseInt(str, 10);
}

//////////////////
////LOG
/////////////////
function log (msg, type) {
    var id = 'SocketChat';
    if (type === 'dir') {
        console.dir(msg);
    } else if (type === 'warn') {
        console.warn(id + " : " + msg);
    } else if (type === 'error'){
        console.error(id + " : " + msg);
    } else {
        console.log(id + " : " + msg);
    }
}

//////////////////
////SOCKET LOG
/////////////////
function socketLog(msg) {
    console.log('Socket Server: ' + msg);
}