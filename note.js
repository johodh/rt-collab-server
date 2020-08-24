const uuid = require('./uuid.js');
const Db = require('./db.js'); 

var activeNotes = []; 

class Note { 
	constructor(uid = null, existingNote = null) {
		if (uid) {
			this.id = uuid.create();
			this.owner = uid;
			this.collabs = [];
			this.activeCollabs = [];
			this.body = [];
			Db.createNote(this.id, this.owner); 
			console.log('creating new note in db with uid: ' + this.owner + ' and noteId: ' + this.id); 
		} 
		if (existingNote) {
			this.id = existingNote.noteId; 
			this.collabs = existingNote.collabs.split(',').map(Number)
			this.activeCollabs = []; 
			this.owner = existingNote.owner;
			this.body = existingNote.body.split('\n');
		}
		this.title = '';
		activeNotes.push(this); 
		console.log('constructor: activeNotes.length: ' + activeNotes.length)
	}

	getNoteBody() { 
		var stringbody = ''
		for (var i=0; i<this.body.length-1; i++) {
			stringbody += this.body[i] + '\n';
		}
		stringbody += this.body[this.body.length-1];
		return stringbody;
	}

	newLine(lineNo) { 
		this.body.splice(lineNo,0,'');
		this.updateDb();
	}
	
	updateLine(lineNo, lineText) {
		this.body[lineNo] = lineText; 
		console.log('updateLine NUMBER ' + lineNo + ' with ' + lineText);
		this.updateDb();
	}
	
	deleteLine(lineFrom, lineTo) { 
		var noLines = lineTo-lineFrom+1;
		this.body.splice(lineFrom,noLines)
		this.updateDb(); 
	}

	updateDb() {
		const body = this.getNoteBody(this.body);
		Db.updateNote(this.id, this.collabs, body);
	}

	disconnect(user) { 
		//maybe use an identifier instead of user object 
		const i = this.activeCollabs.indexOf(user); 
		if ( i === 0 ) { this.activeCollabs.splice(i) } 
		else { this.activeCollabs.splice(i,i) }
	}

	destroy() { 
		const i = activeNotes.indexOf(this);
		if ( i === 0) { activeNotes.splice(i) }
		else { activeNotes.splice(i,i) }
		console.log('destroy(): activeNotes.length: ' + activeNotes.length)
	}

	static getActiveNoteById(noteId) { 
		var match = null;
		activeNotes.forEach(function (note) { 
			if (note.id === noteId) { 
				match = note;
			} 
		});
		return match; 
	}

	static destroy(noteId) { 
		const i = activeNotes.indexOf(this.getActiveNoteById(noteId));
		activeNotes.splice(i,i); 
	}

}


module.exports = Note; 
