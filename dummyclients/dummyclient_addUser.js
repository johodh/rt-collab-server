const WebSocket = require('ws')
const url = 'ws://192.168.1.20:8080'
//const connection = new WebSocket(url,'none','media')
const key = 'd7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592'
const login = { request: 'login', user: 'johan', password: 'johan' }

const connection = new WebSocket(url, [ JSON.stringify(login) ])
// const connection = new WebSocket(url, ["access_token", key])
connection.onopen = () => {
//	connection.send('Message From Client') 
	var msg = {
		type: 'addUser',
		expiration: '24'
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

