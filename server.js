const express = require("express");
const app = express(); // initializing express application
const server = require("http").Server(app); // creating server
const io = require("socket.io")(server);
const { v4: uuidv4 } = require("uuid"); // import uuid in server.js
const { ExpressPeerServer } = require("peer"); // import peer
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.set("view engine", "ejs");

app.use(express.static("public")); // set public url
app.use("/peerjs", peerServer); // specify peer server the url

app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`); // generate uuid and will redirect to local host
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room }); // passing roomId to front
});

const users = {};
const users1 = {};

io.on("connection", (socket) => {
  const socketId = socket.id;
  socket.on("new-user-joined", (name) => {
    users1[socket.id] = name;
    socket.broadcast.emit("user-joined", name);
  });

  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId); // joined the room from specific Id
    socket.broadcast.to(roomId).emit("user-connected", userId); // broadcasts user connected

    socket.on("disconnect", () => {
      socket.broadcast.to(roomId).emit("user-disconnect", userId);
    });

    socket.on("message", (message) => {
      // receive our text message
      io.to(roomId).emit("createMessage", {
        message: message,
        name: users1[socket.id],
      });
    });
  });
});

server.listen(process.env.PORT || 3030); // local host port: 3000
