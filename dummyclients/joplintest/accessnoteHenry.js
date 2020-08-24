const WebSocket = require('ws')
const url = 'ws://192.168.1.20:8080'
const login = { request: 'login', user: 'HenryMac', password: 'AndCheese' }

const connection = new WebSocket(url, [ JSON.stringify(login) ])
connection.onopen = () => {
//	connection.send('Message From Client') 
	var msg = {
		type: 'accessNote',
		noteId: 'c566a4da05c44d4c998d8d91d524872e'
	}
	connection.send(JSON.stringify(msg));
	var wait = {
		type: 'wait'
	}
	connection.send(JSON.stringify(wait));
}
 
connection.onerror = (error) => {
//  console.log(`WebSocket error: ${error}`)
	console.log(error);
}
 
connection.onmessage = (e) => {
	console.log(e.data);
}
//setInterval(function() { 
//	connection.send('testing testing!') 
//},2000);

