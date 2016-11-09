const express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	favicon = require('server-favicon');

app.use(express.static(__dirname + '/public'))
app.use(favicon(__dirname + '/public/favicon.ico'))

server.listen(15333, () => { console.log('http://localhost:15333') });

const userNames = { 'Jenkins': 'Jenkins' };

io.on('connection', socket => {
	let name;

	socket.on('user:init', (data, callback) => {
		
		if (!userNames[data.name]) {
			name = data.name;
			userNames[name] = name;

			let userList = [];
			for (user in userNames) {
				userList.push(user);
			}

			io.sockets.emit('user:join', { name });
			
			callback({ name: name, users: userList });

		} else {

			callback({ error: 'Username already taken' });
		}
	});

	socket.on('message:send', function (data) {
		
		socket.broadcast.emit('message:receive', {
			user: name,
			text: data.text
		});
	});

	socket.on('user:name', function (data, callback) {
		let newName = data.newName, oldName = name;

		if (userNames[newName]) {

			callback({ error: 'Name already taken.' });

		} else {

			delete userNames[oldName];
			userNames[newName] = newName;
			name = newName;

			callback({ name: newName });

			socket.broadcast.emit('user:changed', { oldName, newName });
		}
	});

	socket.on('disconnect', function () {
		if (userNames[name]) delete userNames[name];
		socket.broadcast.emit('user:left', { name	});
	});
});
