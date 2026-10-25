import { Server } from "socket.io";

// room path -> array of socket ids
let connections = {};

// room path -> array of chat messages
let messages = {};

// socket id -> time the user connected
let timeOnline = {};

const connectToSocketServer = (server) => {
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

    timeOnline[socket.id] = new Date();

    // =====================================
    // JOIN CALL
    // =====================================
    socket.on("join-call", (path) => {
      if (connections[path] === undefined) {
        connections[path] = [];
      }

      connections[path].push(socket.id);

      // send EVERY user in the room: (new user's id, full list of ids)
      connections[path].forEach((id) => {
        io.to(id).emit("user-joined", socket.id, connections[path]);
      });

      // send old chat messages to the user who just joined
      if (messages[path] !== undefined) {
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

    // =====================================
    // SIGNAL (WebRTC offer / answer / ice)
    // =====================================
    socket.on("signal", (toId, message) => {
      io.to(toId).emit("signal", socket.id, message);
    });

    // =====================================
    // CHAT MESSAGE
    // =====================================
    socket.on("chat-message", (data, sender) => {
      // object.entries == ye connections ke andar jitni bhi entries hai vo sab laa kr denga
      const [matchingRoom, found] = Object.entries(connections).reduce(
        ([room, isFound], [roomKey, roomValue]) => {
          if (!isFound && roomValue.includes(socket.id)) {
            return [roomKey, true];
          }
          return [room, isFound];
        },
        // agar kuch nahi mila to koi nahi hai
        ["", false],
      );

      if (found === true) {
        if (messages[matchingRoom] === undefined) {
          messages[matchingRoom] = [];
        }

        messages[matchingRoom].push({
          sender: sender,
          data: data,
          "socket-id-sender": socket.id,
        });

        console.log("message", matchingRoom, ":", sender, data);
        // socket id sender is liye kyuki hum detect kr sake ki kaha se aa rha hai

        connections[matchingRoom].forEach((element) => {
          io.to(element).emit("chat-message", data, sender, socket.id);
        });
      }
    });

    // =====================================
    // DISCONNECT
    // =====================================
    socket.on("disconnect", () => {
      var diffTime = Math.abs(timeOnline[socket.id] - new Date());
      console.log("User left:", socket.id, "after", diffTime, "ms");

      for (const key of Object.keys(connections)) {
        const index = connections[key].indexOf(socket.id);

        // user mil gaya hai
        if (index !== -1) {
          connections[key].splice(index, 1);

          // tell everyone left in the room
          connections[key].forEach((id) => {
            io.to(id).emit("user-left", socket.id);
          });

          // agar room khali ho gaya to delete kar do
          if (connections[key].length === 0) {
            delete connections[key];
          }
        }
      }

      delete timeOnline[socket.id];
    });
  });

  return io;
};

export default connectToSocketServer;
