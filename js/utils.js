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
////REMOVE ELEMENT
/////////////////
function removeElement (element) {
    try {
        element.remove();
    } catch (err) {
        element.parentNode.removeChild(element);
    }
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

function socketLog(msg) {
    console.log('Socket Server: ' + msg);
}