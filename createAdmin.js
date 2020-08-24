const Encryption = require('./encryption.js'); 
const Db = require('./db.js');

const salt = Encryption.createSalt(); 
const passwordHash = Encryption.passwdHash('johan',salt); 

Db.addUser(0, 'johan', passwordHash, salt, 'admin');
