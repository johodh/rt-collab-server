const WebSocket = require('ws')
const url = 'ws://192.168.1.20:8080'
const login = { request: 'login', user: 'johan', password: 'johan' }

const connection = new WebSocket(url, JSON.stringify(login))
connection.onopen = () => {
//	connection.send('Message From Client') 
	var msg = {
		type: 'accessNote',
		noteId: 'c566a4da05c44d4c998d8d91d524872e'
	}
	connection.send(JSON.stringify(msg));
	setTimeout(function() { 
		msg = { 
			type: 'exit'
		}
		connection.send(JSON.stringify(msg)); 
	}, 2000);
	setTimeout(function() { 
		var msg = {
			type: 'accessNote',
			noteId: 'c566a4da05c44d4c998d8d91d524872e'
		}
		connection.send(JSON.stringify(msg)); 
	}, 4000);
}
 
connection.onerror = (error) => {
  console.log(`WebSocket error: ${error}`)
}
 
connection.onmessage = (e) => {
	console.log(e.data);
}
//setInterval(function() { 
//	connection.send('testing testing!') 
//},2000);

