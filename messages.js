// Only newCollaborator and getNote are used by the server, but i might use this module as a template for both client and server. 

const Messages = {}; 

Messages.newCollaborator = function(uid, username) {
	return {
		'uid': uid,
		type: 'newCollaborator',
		'username': username
	};
}

Messages.getNote = function(uid, title, body) {
	return {
		'uid': uid,
		type: 'getNote',
		'title': title,
		'body': body
	}
}

Messages.invalid = function() { 
	return { 
		type: 'Invalid request'
	}
}

Messages.updateLine = function(uid, lineNo, lineText) { 
	return {
		'uid': uid,
		type: 'updateLine',
		'lineNo': lineNo,
		'lineText': lineText
	};
}

Messages.pushCursor = function(uid, cursorPos) {
	return {
		'uid': uid,
		type: 'cursorMove', 
		'cursorPos': cursorPos
	}
}

Messages.updateSelection = function(uid, selection) {
	return {
		'uid': uid,
		type: 'updateSelection',
		'selection': selection
	}
}

Messages.lineOperation = function(uid, lineOp, lineFrom, lineTo=false) {
	return {
		'uid': uid,
		type: lineOp,
		'lineFrom': lineFrom,
		'lineTo': lineTo
	}
}

// AUTH 

Messages.auth = function(err, source) { 
	if (err === 1) { var msg = { description: 'no credentials in request header', ip: source } }
	else if (err === 2) { var msg = { type: 'failed login', description: 'user does not exist', ip: source } }
	else if (err === 3) { var msg = { type: 'failed login', description: 'wrong password', ip: source } }
	else if (err === 4) { var msg = { type: 'failed login', description: 'credentials are missing username or password', ip: source } }
	else if (err === 5) { var msg = { type: 'failed new user attempt', description: 'unable to verify hmac' } }
	else if (err === 6) { var msg = { type: 'failed new user attempt', description: 'hmac has expired, OR couldnt find pending user' } } 
	else if (err === 7) { var msg = { type: 'unknown request', description: 'not login or newUser' } } 
	return msg; 
}

module.exports = Messages; 
