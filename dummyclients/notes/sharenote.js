const WebSocket = require('ws')
const url = 'ws://192.168.1.20:8080'
const login = { request: 'login', user: 'HenryMac', password: 'AndCheese' }

const connection = new WebSocket(url, [ JSON.stringify(login) ])
connection.onopen = () => {
//	connection.send('Message From Client') 
	var msg = {
		type: 'shareNote',
		noteId: 'c566a4da05c44d4c998d8d91d524872e',
		newCollab: '4'
	}
	connection.send(JSON.stringify(msg));
}
 
connection.onerror = (error) => {
  console.log(`WebSocket error: ${error}`)
}
 
connection.onmessage = (e) => {
  console.log(e.data)
	var msgtwo = {
		type: 'updateLine',
		lineNo: 1,
		lineText: 'Hello!'
	}
	connection.send(JSON.stringify(msgtwo));
}
//setInterval(function() { 
//	connection.send('testing testing!') 
//},2000);

