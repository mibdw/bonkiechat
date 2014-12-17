var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {

	var gebruiker = 0;

	socket.on('letter', function (letter) { 
		gebruiker = letter.toUpperCase();
		io.emit('aankomst', gebruiker);
	});

	socket.on('bericht', function (bericht) { 
		io.emit('nieuw', {'gebruiker': gebruiker, 'inhoud': bericht }); 
	});

	socket.on('disconnect', function () {
		io.emit('vertrek', gebruiker);
  });
});

http.listen(15333, function () {
	console.log('Bonkiechat rules!');
});
