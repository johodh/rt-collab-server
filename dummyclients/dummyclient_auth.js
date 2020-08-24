const WebSocket = require('ws')
const url = 'ws://127.0.0.1:8080'
const login = { request: 'login', user: 'HenryMac', password: 'AndCheese' }

const connection = new WebSocket(url, [ JSON.stringify(login) ])
connection.onopen = () => {
//	connection.send('Message From Client') 
	var msg = {
		type: 'nonsense'
	}
	connection.send(JSON.stringify(msg));
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

