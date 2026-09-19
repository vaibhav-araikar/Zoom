import express, { urlencoded } from "express";
import { createServer } from "node:http";
// jo hamara socket ka sever hai vo alag hai and hamara express ka server alag hai, and in dono ko connect krne ke liye koi chahiye..... and in dono ko connect krta hai hamara createServer

import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import router from "./src/routes/route.js";
import connectToSocketServer from "./src/controllers/socketManager.js";

dotenv.config();
// console.log("MONGO_URL:", process.env.MONGO_URL);

const app = express();
const PORT = process.env.PORT || 5000;

const server = createServer(app);
// app ko server ke sath connect kr diya, ab hamara server express ka bhi hai and socket ka bhi hai
const io = connectToSocketServer(server);
// jab hum server chalayenge tab usme hamara app and io dono honga

app.set("port", process.env.PORT || 5000);
app.use(cors());
// we are using cors to tackle the cross origin issue, because our frontend and backend are running on different ports, so we need to allow the frontend to access the backend
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));
import userRoutes from "./src/routes/users.routes.js";

app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

app.use("/api/v1/users", userRoutes);

const start = async () => {
  const dbURL = process.env.MONGO_URL;
  await mongoose.connect(dbURL);

  server.listen(app.get("port"), () => {
    console.log(`Server is running on port ${app.get("port")}`);
  });
};

start();

// Learning Socket IO Documentation
