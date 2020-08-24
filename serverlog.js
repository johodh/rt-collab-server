//TODO: make proper logging to db or file
// Timestamps.. 

const clog = true; 

function tstamp() { 
	let tstampRaw = new Date()
	let tstamp = tstampRaw.getFullYear() + "-" + (tstampRaw.getMonth() + 1) + "-" + tstampRaw.getDate() + " " + tstampRaw.getHours() + ":" + tstampRaw.getMinutes() + ":" + tstampRaw.getSeconds() 
	return tstamp; 
}

// change these to one function, take 2 arguments, origin and msg

function serverLog(source, msg) {
	if (clog) { console.log(tstamp() + ' ' + source + ' ' + JSON.stringify(msg)) }; 
}

module.exports = serverLog;


