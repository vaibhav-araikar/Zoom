import { Server, Socket } from "socket.io";

let connections = {};

let messages = {};

let timeOnline = {};

const connectToSocketServer = (server) => {
  const io = new Server(server);

  io.on("connection", (socket) => {
    socket.on("join-call", (path) => {
      if (connections[path] === undefined) {
        connections[path] = [];
      }
      connections[path].push(socket.id);
      timeOnline[socket.id] = new Date(0);

      for (let a = 0; a < connections[path].length; a++) {
        io.to(connections[path][a]).emit("user-joined", socket.id);
      }
    });

    socket.on("signal", (toId, message) => {
      io.to(toId).emit("signal", socket.id, message);
    });

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
          messages[matchingRoom] = [""];
        }
        messages[matchingRoom].push({
          sender: sender,
          data: data,
          "socket-id-sender": socket.id,
        });
        console.log("message", key, ":", sender, data);
        // socket id sender is liye kyuki hum detect kr sake ki kaha se aa rha hai

        connections[matchingRoom].forEach((element) => {
          io.to(element).emit("chat-message", data, sender, socket.id);
        });
      }
    });

    socket.on("disconnect", () => {
      var diffTime = Math.abs(timeOnline[socket.id] - new Data());

      var key;

      for (const [k, v] of JSON.parse(
        JSON.stringify(Object.entries(connections)),
      )) {
        // ab yaha hum ek deep banayenge kyuki humse vo wala data naa uud jaaye jise hame udana nahi hai
        for (let a = 0; a < v.length; ++a) {
          // user mil gaya hai
          if (v[a] == socket.id) {
            key = k;

            for (let a = 0; a < connections[key].length; ++a) {
              io.to(connections[key][a]).emit("user-left", socket.id);
            }

            var index = connections[key].indexOf(socket.id);
            connections[key].splice(index, 1);

            // agar user disconnect hote gaye hote gaye and uers ki length ek time 0 ho jayegi
            if (connections[key].length === 0) {
              delete connections[key];
            }
          }
        }
      }
    });
  });

  return io;
};

export default connectToSocketServer;
