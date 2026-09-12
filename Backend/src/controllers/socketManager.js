import { Server } from "socket.io";

const connectToSocketServer = (server) => {
  const io = new Server(server);
  return io;
};

export default connectToSocketServer;
