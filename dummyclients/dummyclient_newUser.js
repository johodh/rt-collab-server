const WebSocket = require('ws')
const url = 'ws://192.168.1.20:8080'
const hmac = '7b2321420fddb60b6f6af41dceef634fc42d9bec856dd99d40d6f1b3484299f9';
const uid = 1;
const exp = 1591903195;
const login = { request: 'newUser', 'exp': exp, 'uid': uid, 'hmac': hmac, username: 'HenryMac', password: 'AndCheese' }

const connection = new WebSocket(url, [ JSON.stringify(login) ])
// const connection = new WebSocket(url, ["access_token", key])
connection.onopen = () => {
	var secondMsg = {
		type: 'addUser',
	}
	console.log('sending: ' + JSON.stringify(secondMsg));
	connection.send(JSON.stringify(secondMsg)); 
}
 
connection.onerror = (error) => {
  console.log(`WebSocket error: ${error}`)
}
 
connection.onmessage = (e) => {
  console.log(e.data)
}
//setInterval(function() { 
//	connection.send('testing testing!') 
//},2000);

