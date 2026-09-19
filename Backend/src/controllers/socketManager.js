import { Server } from "socket.io";

let connections = {};

let messages = {};

let timeOnline = {};

const connectToSocketServer = (server) => {
  const io = new Server(server);
  return io;
};

export default connectToSocketServer;
