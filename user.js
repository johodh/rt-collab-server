var connectedUsers = []; 

class User { 
	constructor(ws, uid, username, ip, perms, mgr) {
		this.ws = ws;
		this.uid = uid;
		this.username = username; 
		this.ip = ip; 
		this.perms = perms; 
		this.notes = [];
		this.activeNote = null
		this.pendingNote = null;
		this.listener = null; 
		this.mgr = mgr ? true : false; 
		connectedUsers.push(this); 
	}

	disconnect() {
		const i = connectedUsers.indexOf(this);
		if (i === 0) { connectedUsers.splice(i) } 
		else { connectedUsers.splice(i,i) }
	}

	static getUserById(uid) { 
		var match = null; 
		connectedUsers.forEach(function(user) { 
			if (user.uid === uid) { 
				match = user; 
			}
		});
		return match; 
	}

}

module.exports = User; 
