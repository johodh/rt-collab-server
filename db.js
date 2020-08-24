const sqlite3 = require('sqlite3').verbose(); 

let db = new sqlite3.Database('./db/data.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the database.');
  Db.getUids(); 
//  Db.getAllUsers(); 
});

// TODO: init function, create tables if not exists. 


let userTable = `CREATE TABLE userinfo (
	uid INTEGER PRIMARY KEY,
	perms TEXT NOT NULL,
	username TEXT NOT NULL,
	password TEXT NOT NULL,
	salt TEXT NOT NULL
);`

db.all(userTable,[],(err, rows ) => {});

let noteTable = `CREATE TABLE note (
	noteId TEXT PRIMARY KEY,
	owner TEXT NOT NULL,
	collabs TEXT NOT NULL,
	title TEXT,
	body TEXT
);`

db.all(noteTable,[],(err, rows ) => {});

const Db = {};

Db.addUser = function(uid, username, password, salt, perms = 'user') { 
	let sql = 'INSERT INTO userinfo (uid, perms, username, password, salt) VALUES ("' + uid + '","' + perms + '","' + username + '","' + password +'","' + salt + '")';
	db.all(sql, [], (err, rows) => {});
}

Db.removeUser = function(uid) {
	let sql = 'DELETE FROM userinfo WHERE uid = ' + uid +';';
	db.all(sql, [], (err, rows) => {});
}

Db.getUserByName = function(params) {
    return new Promise(function(resolve, reject) {
	var sql = `SELECT uid, perms, username, password, salt
           FROM userinfo
           WHERE username = ?`;
        db.get(sql, params, function(err, row)  {
            if(err) reject("Read error: " + err.message)
            else {
                resolve(row)
            }
        })
    }) 
}

Db.uid_ = [];
Db.getUids = function() {
    return new Promise(function(resolve, reject) {
	var sql = `SELECT uid FROM userinfo`;
        db.all(sql, [], function(err, rows)  {
            if(err) reject("Read error: " + err.message)
            else {
                rows.forEach((row) => { Db.uid_.push(row.uid) });
            }
        })
    }) 
}

Db.allUsers = [];
Db.getAllUsers = function() {
    return new Promise(function(resolve, reject) {
	var sql = `SELECT username,perms FROM userinfo`;
        db.all(sql, [], function(err, rows)  {
            if(err) reject("Read error: " + err.message)
            else {
                rows.forEach((row) => { Db.allUsers.push( { username: row.username, perms: row.perms } ) });
            }
        })
    }) 
}

Db.getNote = function(params) {
    return new Promise(function(resolve, reject) {
	var sql = `SELECT noteId, owner, collabs, title, body
           FROM note
           WHERE noteId = ?`;
        db.get(sql, params, function(err, row)  {
            if(err) reject("Read error: " + err.message)
            else {
                resolve(row)
            }
        })
    }) 
}

Db.updateNote = function(noteId, collabs, body) {
	console.log('db.js: updating ' +noteId+ ' with body');
	console.log(body);
	console.log('and collaborators: ' + collabs);
	let sql = "UPDATE note SET body='" + body + "',collabs='" + collabs + "' WHERE noteId='" + noteId + "'";
	db.all(sql, [], (err, rows) => {});

}

Db.createNote = function(noteId, uid) { 
	let sql = 'INSERT INTO note (noteId, owner, collabs, title, body) VALUES ("' + noteId + '","' + uid + '","' + uid +'","title","body")';
	db.all(sql, [], (err, rows) => {});
}
module.exports = Db; 
