const WebSocket = require('ws')
const url = 'ws://192.168.1.20:8080'
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
setInterval(function() { 
	connection.send('testing testing!') 
},8000);

