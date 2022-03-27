var express = require("express"),
  app = express(),
  server = require("http").createServer(app),
  io = require("socket.io")(server);

app.use(express.static(__dirname + "/public"));

server.listen(46876, function () {
  console.log("http://localhost:46876");
});

var userNames = { Jenkins: "Jenkins" };

io.on("connection", function (socket) {
  var name;

  socket.on("user:init", (data, callback) => {
    if (!userNames[data.name]) {
      name = data.name;
      userNames[name] = name;

      var userList = [];
      for (user in userNames) {
        userList.push(user);
      }

      io.sockets.emit("user:join", { name });

      callback({ name: name, users: userList });
    } else {
      callback({ error: "Username already taken" });
    }
  });

  socket.on("message:send", function (data) {
    socket.broadcast.emit("message:receive", {
      user: name,
      text: data.text,
    });
  });

  socket.on("user:name", function (data, callback) {
    var newName = data.newName,
      oldName = name;

    if (userNames[newName]) {
      callback({ error: "Name already taken." });
    } else {
      delete userNames[oldName];
      userNames[newName] = newName;
      name = newName;

      callback({ name: newName });

      socket.broadcast.emit("user:changed", { oldName, newName });
    }
  });

  socket.on("disconnect", function () {
    if (userNames[name]) delete userNames[name];
    socket.broadcast.emit("user:left", { name });
  });
});
