import { Server } from "socket.io";

let connections = {};
let messages = {};
let timeOnline = {};

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["*"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // JOIN CALL
    socket.on("join-call", (path) => {
      if (!connections[path]) {
        connections[path] = [];
      }

      // prevent duplicates
      if (!connections[path].includes(socket.id)) {
        connections[path].push(socket.id);
      }

      timeOnline[socket.id] = new Date();

      // notify all users in room
      connections[path].forEach((id) => {
        io.to(id).emit("user-joined", socket.id, connections[path]);
      });

      // send previous chat messages
      if (messages[path]) {
        messages[path].forEach((msg) => {
          io.to(socket.id).emit(
            "chat-message",
            msg.data,
            msg.sender,
            msg["socket-id-sender"],
          );
        });
      }
    });

    // WEBRTC SIGNAL
    socket.on("signal", (toId, message) => {
      io.to(toId).emit("signal", socket.id, message);
    });

    // CHAT MESSAGE
    socket.on("chat-message", (data, sender) => {
      let matchingRoom = null;

      for (const [room, users] of Object.entries(connections)) {
        if (users.includes(socket.id)) {
          matchingRoom = room;
          break;
        }
      }

      if (matchingRoom) {
        if (!messages[matchingRoom]) {
          messages[matchingRoom] = [];
        }

        messages[matchingRoom].push({
          sender: sender,
          data: data,
          "socket-id-sender": socket.id,
        });

        console.log("message", matchingRoom, ":", sender, data);

        connections[matchingRoom].forEach((id) => {
          io.to(id).emit("chat-message", data, sender, socket.id);
        });
      }
    });

    // DISCONNECT
    socket.on("disconnect", () => {
      const diffTime = Math.abs(new Date() - timeOnline[socket.id]);
      console.log(
        "User disconnected:",
        socket.id,
        "Online for:",
        diffTime / 1000,
        "seconds",
      );

      for (const [room, users] of Object.entries(connections)) {
        const index = users.indexOf(socket.id);

        if (index !== -1) {
          // notify others
          users.forEach((id) => {
            io.to(id).emit("user-left", socket.id);
          });

          users.splice(index, 1);

          if (users.length === 0) {
            delete connections[room];
            delete messages[room];
          }

          break;
        }
      }

      delete timeOnline[socket.id];
    });
  });

  return io;
};
