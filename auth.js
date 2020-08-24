const Db = require('./db.js');
const Encryption = require('./encryption.js');
const User = require('./user.js');
const serverLog = require('./serverlog.js');
const Messages = require('./messages.js');
const Auth = {};

Auth.pendingNewUsers = []; 
Auth.connected = [];
Auth.auth = async function(wss, credentials, request, socket, head) { 
	
	var err = null; 
	if (credentials.request === 'login') {
		if (credentials.user && credentials.password) { 
			var isUser = await Db.getUserByName([credentials.user]);
			if (isUser) {
				const passwdHash = Encryption.passwdHash(credentials.password, isUser.salt); 
				if (passwdHash === isUser.password) { 
					var uid = isUser.uid;
					var utype = isUser.perms;
					var notes = isUser.notes; 
					serverLog('AUTH', { type: 'successful authentication', 'uid': uid, username: credentials.user });	
				} else { err = 3 }
			} else { err = 2 }
		} else { err = 4 }

	} else if (credentials.request === 'newUser') {
		tstamp = Math.round(new Date().getTime()/1000); 

		if ((credentials.exp > tstamp) && (Auth.getPendingUserById(credentials.uid))) {  
			const key = Auth.getPendingUserById(credentials.uid).key;
			const verifyHmac = Encryption.hmac(credentials.uid, credentials.exp, key); 

			if ((verifyHmac === credentials.hmac) && (credentials.username) && (credentials.password)) { 
				// hash password before stored in db. 
				const salt = Encryption.createSalt();
				const passwdHash = Encryption.passwdHash(credentials.password, salt);
				credentials.password = passwdHash;
				Db.addUser(credentials.uid, credentials.username, credentials.password, salt);
				Auth.removePendingUser(credentials.uid);
				var client = credentials.username; 
				var uid = credentials.uid;
				var utype = 'user'; 
				serverLog('NEW USER', { uid: credentials.uid, username: credentials.username });

			} else { err = 5 } 
		} else { err = 6 }
	} else { err = 7 }
	console.log(err);
	console.log(uid);
	if (err || uid === null) {
		socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
		socket.destroy();
		serverLog('AUTH', Messages.auth(err, request.socket.remoteAddress));
 		return;
	}
    wss.handleUpgrade(request, socket, head, function done(ws) {
      new User(ws, uid, credentials.user, request.socket.remoteAddress, utype, credentials.mgr);
      wss.emit('connection', ws, request, uid);
    });
}

Auth.getPendingUserById = function(uid) { 
	const pendingUser = Auth.pendingNewUsers.find(i => i.uid == uid); 
	return pendingUser; 
}

Auth.removePendingUser = function(uid) {
	const index = Auth.pendingNewUsers.indexOf(Auth.pendingNewUsers.find(i => i.uid == uid)); 
	Auth.pendingNewUsers.splice(index,1); 
}

module.exports = Auth; 
