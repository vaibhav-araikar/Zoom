import express from "express";
import { createServer } from "node:http";
// jo hamara socket ka sever hai vo alag hai and hamara express ka server alag hai, and in dono ko connect krne ke liye koi chahiye..... and in dono ko connect krta hai hamara createServer

import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import router from "./routes/route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

app.use("/api", router);

const start = async () => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

start();
