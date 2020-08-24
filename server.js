const http = require('http');
const WebSocket = require('ws');
const User = require('./user.js');
const Note = require('./note.js'); 
const Messages = require('./messages.js'); 
const serverLog = require('./serverlog.js');
const Db = require('./db.js'); 
const Auth = require('./auth.js'); 
const Encryption = require('./encryption.js'); 

const server = http.createServer(); 
const wss = new WebSocket.Server({ noServer: true })
clients = [];
newUserClients = [];

// TODO: 
// - look over variable and function names so consistent and less random

function pushToClients(senderUid, msg, collabs) {
	collabs.forEach(function (client) {
        	if ( senderUid != client.uid ) { 
			client.ws.send(JSON.stringify(msg));  
		};
    	});
	serverLog('websocket OUT', msg);
}

function newCollaborator(sender, collabs) {
	if ( collabs.length > 1 ) {
		pushToClients(sender.uid, Messages.newCollaborator(sender.uid, sender.username), collabs); 
		collabs.forEach(function (client) { 
        		if ( sender.uid != client.uid ) { 
				var msg = Messages.newCollaborator(client.uid, client.username);
				sender.ws.send(JSON.stringify(msg));
				serverLog('websocket OUT', msg); 
			}
		});
	}
}

var accessNote = async function(msg, sender) {
	// check if note instance exists first. if not create it 
	var note = Note.getActiveNoteById(msg.noteId); 
	if (!note) { note = new Note(null, await Db.getNote(msg.noteId)) }
	if ((note.collabs.indexOf(sender.uid) > -1) || (note.owner === sender.uid)) {
		// need way to remove active collabs too! 
		sender.pendingNote = msg.noteId;
		sender.ws.send(JSON.stringify(Messages.getNote(sender.uid, 'title', note.getNoteBody())));
		console.log('accessNote: note.activeCollabs.length: ' + note.activeCollabs.length);
		note.activeCollabs.push(sender);
		newCollaborator(sender, note.activeCollabs)
		sender.ws.removeEventListener('message', sender.listener); 
		sender.listener = message => noteSpace(sender, message, note);
		sender.activeNote = note; 
		sender.ws.on('message', sender.listener);
		msg.status = 'SUCCESS';
	} else { msg.status = 'FAILED, sender not owner or collaborator' }
	serverLog('accessNote', msg); 
}

var shareNote = async function(msg, sender) {
	const sharedNote = new Note(null, await Db.getNote(msg.noteId));
	if ((sharedNote.collabs.indexOf(sender.uid) > -1) || (sharedNote.owner === sender.uid)) {
		console.log('passed owner/collaborator test!');
		sharedNote.collabs.push(msg.newCollab);
		sharedNote.updateDb();
		msg.status = 'SUCCESS';
		// need to send note to new collaborators. queue until they are onnected. 
	} else { msg.status = 'FAILED, sender not owner or collaborator' } 
	serverLog('shareNote', msg);
}

var noteSpace = function(sender, message, note) { 
	var msg = JSON.parse(message);
	msg.uid = sender.uid;
	console.log('notespace: note.activeCollabs.length: ' + note.activeCollabs.length)
	// server side note model management
	if ( msg.type === 'updateLine' ) { 
		note.updateLine(msg.lineNo, msg.lineText)
	//	msg.lineText = 'OMITTED'
	};	

	if (msg.type === 'deleteLine') {
		note.deleteLine(msg.lineFrom, msg.lineTo);
	}

	if (msg.type === 'newLine') { 
		note.newLine(msg.lineFrom);
	}

	if (msg.type === 'exit') { 
		// this routine should happen on socket close instead. 
		note.disconnect(sender);
		if (note.activeCollabs.length < 1) { note.destroy() };
		sender.ws.removeEventListener('message', sender.listener); 
		sender.listener = message => userListener(sender.ws, sender, message); 
		sender.ws.on('message', sender.listener) 
		//test
		sender.ws.send('leaving notespace'); 
		console.log('notespace: note.activeCollabs.length: ' + note.activeCollabs.length)
	}
	serverLog('notespace IN', msg); 
	// if valid collab command
	pushToClients(sender.uid, msg, note.activeCollabs) 
}

var userListener = function(ws, sender, message) {
	var msg=JSON.parse(message);
	msg.uid = sender.uid; 
	serverLog('userspace IN', msg);
	// problem! already in notespace when receiving wait? 
	if ( msg.type === 'newNote') { 
		serverLog('NOTE', msg);
		const newNote = new Note(sender.uid);
		sender.notes.push(newNote.noteId); 
		// change listener to notespace
		ws.removeEventListener('message', sender.listener); 
		sender.listener = message => noteSpace(ws, sender, message, newNote);
		ws.on('message', sender.listener);
		ws.send('welcome to notespace'); 
	} else if ( msg.type === 'accessNote') {
		accessNote(msg, sender);
	} else if (msg.type === 'shareNote') {
		shareNote(msg, sender); 
	} else if (msg.type === 'admin') {
		if (sender.perms === 'admin') {
		var listener = message => adminListener(ws, sender, message);
		sender.ws.on('message', listener);
		}
	} else { 
		// need some form of reality-check on the messages before pushing to clients here.
	}
}

// adminListener is obsolete. Will use managerListener instead, and handle management with separate connection from inside joplin config screen. 

var getUsers = async function(msg, sender) { 
	sender.ws.send(JSON.stringify(Db.allUsers)); 
	console.log('got getUsers'); 
	await Db.getAllUsers(); 
	console.log(Db.allUsers); 
}

var managerListener = function(ws, sender, message) {
	var msg = JSON.parse(message); 
	msg.uid = sender.uid; 
	if ( msg.type === 'getUsers' ) { 
		getUsers(msg, sender) 
	}

	if ( msg.type === 'addUser' ) { 
		// create a new user id, uses the highest existing id and add one to that.
		const newUserId = Db.uid_[Db.uid_.length-1]+1;
		// add it to cached array containing existing and pending new users
		Db.uid_[Db.uid_.length] = newUserId; 
		// create HMAC to share. the new user will post this to register new account. 
		var msgOut = Encryption.createToken(newUserId, msg['expiration']); 
		// push new uid and key to cache. server will use this to verify hmac when user posts it. for now that means you would need to send a new invitation if server is shut down or restarted before registration takes place. 
		Auth.pendingNewUsers.push({ uid: newUserId, key: msgOut.key });  
		// omit key in message back to admin and serverlog
		msgOut.key = 'OMITTED';
		ws.send(JSON.stringify(msgOut));
		serverLog('websocket OUT', msgOut);
	} else if (msg.type === 'deleteUser' ) {
		// TODO: remove user from db and uid array. 
		serverLog('websocket OUT', msg); 

	} 
	serverLog('managerspace IN', msg); 
}

var closeWebsocket = function(user) {
	if (user.activeNote) { 
		if (user.activeNote.activeCollabs.length === 1) { user.activeNote.destroy() } 
		user.activeNote.disconnect(user); 
	}
	console.log(user.username + ' disconnected'); 
}


wss.on('connection', function connection(ws, req, clientUid) {
	const user = User.getUserById(clientUid); 
	serverLog('websocket [connection established]', { ip: user.ip, uid: clientUid, username: user.username, perms: user.perms });

	// TODO: no need to pass ws to listeners, as ws is already in user. look over changing that
	user.listener = message => user.mgr ? managerListener(ws, user, message) : userListener(ws, user, message)
	ws.on('message', user.listener) 
	ws.on('close', message => closeWebsocket(user)); 
})

server.on('upgrade', function upgrade(request, socket, head) {
	// tar token ur upgrade headern (skickas som { access_token, <token> }) 
	const getCredentials = request.headers['sec-websocket-protocol'];
	if (getCredentials) {
		const credentials = JSON.parse(getCredentials); 
		if (credentials.request) {
			credentials.ip = request.socket.remoteAddress;
			serverLog('http IN ', JSON.stringify(credentials)); 
			Auth.auth(wss, credentials, request, socket, head); 
		}
	} else {
		serverLog('AUTH', Messages.auth(1, request.socket.remoteAddess));
		// serverlog failed attempt. block on many tries?
	}
  });


server.listen(8080);
