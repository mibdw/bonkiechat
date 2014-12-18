var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/public')); 

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

var gebruikers  = [];

io.on('connection', function (socket) {

	var gebruiker = 0;

	socket.on('letter', function (letter) { 
		gebruiker = letter.toUpperCase();
		gebruikers.push(gebruiker);
		socket.broadcast.emit('aankomst', {'gebruiker': gebruiker });
		socket.emit('overzicht', gebruikers);		
	});

	socket.on('bericht', function (bericht) { 
		socket.broadcast.emit('nieuw', {'gebruiker': gebruiker, 'inhoud': bericht }); 
	});

	socket.on('disconnect', function () {
		var i = gebruikers.indexOf(gebruiker);
		if (i > -1) gebruikers.splice(i, 1);
		socket.broadcast.emit('vertrek', gebruiker);
		socket.emit('overzicht', gebruikers);
	});
});

http.listen(15333, function () {
	console.log('Bonkiechat rules!');
});
