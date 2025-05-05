// === server.js ===

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
// Serve static files from the React app
app.use(express.static(path.join(__dirname, "build")));

// Fallback to index.html for React Router
app.get("/chat", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const users = {}; // username -> socket.id
const sockets = {}; // socket.id -> username

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Register username with socket
  socket.on("register", (username) => {
    users[username] = socket.id;
    sockets[socket.id] = username;
    console.log(`User registered: ${username}`);
  });

  // Handle private messages
  socket.on("privateMessage", ({ from, to, message }) => {
    const toSocketId = users[to];
    const senderName =
      sockets[socket.id] || from || `Unregistered-${socket.id.slice(0, 4)}`;
    if (toSocketId) {
      io.to(toSocketId).emit("privateMessage", { from: senderName, message });
    }
  });
  socket.on("typing", (data) => {
    socket.broadcast.emit("typing", data); // send to others
  });

  socket.on("stopTyping", () => {
    socket.broadcast.emit("stopTyping");
  });
  // Handle public messages
  socket.on("publicMessage", ({ from, message }) => {
    const senderName =
      sockets[socket.id] || from || `Unregistered-${socket.id.slice(0, 4)}`;
    io.emit("publicMessage", { from: senderName, message });
  });

  // Send list of all users (except the current user)
  socket.on("getUsers", () => {
    const username = sockets[socket.id];
    const usernames = Object.keys(users).filter((u) => u !== username);
    socket.emit("usersList", usernames);
  });

  // Cleanup on disconnect
  socket.on("disconnect", () => {
    const username = sockets[socket.id];
    if (username) {
      delete users[username];
    }
    delete sockets[socket.id];
    console.log("User disconnected:", socket.id);
  });
});

server.listen(3001, () => {
  console.log("Server is running on http://localhost:3001");
});
