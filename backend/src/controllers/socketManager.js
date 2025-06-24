import { Server } from "socket.io";

let connections = {};
let messages = {};
let timeOnline = {};
let roomUserMap = {}; // Track usernames per room

export const connectToSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["*"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("⚡ New connection:", socket.id);

    socket.on("join-call", ({ path, username }) => {
      if (!path || !username) return;

      if (!roomUserMap[path]) roomUserMap[path] = new Set();

      if (roomUserMap[path].has(username)) {
        socket.emit("already-in-call");
        console.log(`❌ Duplicate user ${username} tried to join ${path}`);
        return;
      }

      // Add user
      roomUserMap[path].add(username);
      socket.username = username;
      socket.room = path;

      if (!connections[path]) connections[path] = [];
      connections[path].push(socket.id);
      timeOnline[socket.id] = new Date();

      // Notify all users in room
      connections[path].forEach((id) => {
        io.to(id).emit("user-joined", socket.id, connections[path]);
      });

      // Send past chat messages
      if (messages[path]) {
        messages[path].forEach((msg) => {
          io.to(socket.id).emit(
            "chat-message",
            msg.data,
            msg.sender,
            msg["socket-id-sender"]
          );
        });
      }
    });

    socket.on("signal", (toId, message) => {
      io.to(toId).emit("signal", socket.id, message);
    });

    socket.on("chat-message", (data, sender) => {
      const roomEntry = Object.entries(connections).find(([_, ids]) =>
        ids.includes(socket.id)
      );
      if (!roomEntry) return;

      const [room] = roomEntry;
      if (!messages[room]) messages[room] = [];

      messages[room].push({
        sender,
        data,
        "socket-id-sender": socket.id,
      });

      connections[room].forEach((id) => {
        io.to(id).emit("chat-message", data, sender, socket.id);
      });
    });

    socket.on("disconnect", () => {
      const disconnectTime = new Date();
      const duration = Math.abs(disconnectTime - timeOnline[socket.id]);

      for (const [room, ids] of Object.entries(connections)) {
        if (ids.includes(socket.id)) {
          connections[room] = ids.filter((id) => id !== socket.id);
          io.to(room).emit("user-left", socket.id);

          // Clean user record
          if (socket.username && roomUserMap[room]) {
            roomUserMap[room].delete(socket.username);
            if (roomUserMap[room].size === 0) delete roomUserMap[room];
          }

          // Clean connection record
          if (connections[room].length === 0) delete connections[room];
        }
      }

      delete timeOnline[socket.id];
    });
  });

  return io;
};
