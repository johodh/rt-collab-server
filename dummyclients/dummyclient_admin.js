const WebSocket = require('ws')
const url = 'ws://127.0.0.1:8080'
const login = { request: 'login', user: 'johan', password: 'johan', mgr: true }

const connection = new WebSocket(url, [ JSON.stringify(login) ])

connection.onopen = () => {
	var secondMsg = { 
		type: 'admin', 
	}
	connection.send(JSON.stringify(secondMsg)); 
	var thirdMsg = { 
		type: 'getUsers', 
	}
	connection.send(JSON.stringify(thirdMsg)); 
}
 
connection.onerror = (error) => {
  console.log(`WebSocket error: ${error}`)
}
 
connection.onmessage = (e) => {
  console.log(e.data)
}
//setInterval(function() { 
//	connection.send('{"type":"testing testing!"}') 
//},2000);

