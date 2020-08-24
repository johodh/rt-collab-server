var sjcl = require('/home/jo/Workspace/js/01-tutorials/sjcl/sjcl.js');
const crypto = require('crypto');

const Encryption = {};
 
// PBKDF2 function. 
var hmacSHA256 = function (key) {
    var hasher = new sjcl.misc.hmac( key, sjcl.hash.sha256 );
    this.encrypt = function () {
        return hasher.encrypt.apply( hasher, arguments );
    };
};


Encryption.createSalt = function() { 

    // seed sjcl RNG with entropy from crypto.randomBytes
    var buf = crypto.randomBytes(1024 / 8) // 128 bytes
    buf = new Uint32Array(new Uint8Array(buf).buffer)
    sjcl.random.addEntropy(buf, 1024, "crypto.randomBytes")

    // 4 words = 128bit
    var saltBits = sjcl.random.randomWords(4);
    var passwordSalt = sjcl.codec.hex.fromBits(saltBits);

    return passwordSalt; 
} 

Encryption.createAdminKey = function(password, passwordSalt = this.createSalt()) {
    var derivedKey = sjcl.misc.pbkdf2( password, passwordSalt, 100, 256, hmacSHA256 );
    var hexKey = sjcl.codec.hex.fromBits( derivedKey );

    return hexKey
}

Encryption.hmac = function(uid, exp, key) {	
    var out = (new sjcl.misc.hmac(key, sjcl.hash.sha256)).mac(uid+exp);
    var hmac = sjcl.codec.hex.fromBits(out); 
    return hmac;
}

Encryption.passwdHash = function(password, salt = null) {
	if (!salt) { const salt = this.createSalt() }; 
	const passwdHash = Encryption.hmac(null, password, salt);
	return passwdHash; 
}

Encryption.createToken = function(uid, expiration) {
    // using createSalt (128 bit) to generate password less temporary keys for now. these are used to verify HMACs on newUser requests
    var key = this.createSalt();
    // current timestamp in seconds since epoch
    var timestamp = Math.round(new Date().getTime()/1000);
    // expiration timestamp in seconds since epoch
    var exp = timestamp+expiration*60*60;
    var hmac = Encryption.hmac(uid, exp, key);
    var msg = { 
	    type: 'token',
	    token: hmac,
	    'uid': uid, 
	    'expiration': exp,
	    'key': key
    }
	return msg; 
}

module.exports = Encryption; 

