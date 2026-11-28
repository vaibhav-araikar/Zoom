import express from "express";
import { createServer } from "node:http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import userRoutes from "./src/routes/users.routes.js";
import connectToSocketServer from "./src/controllers/socketManager.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const server = createServer(app);
const io = connectToSocketServer(server);

// Middleware
app.set("port", PORT);
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(
  express.urlencoded({
    limit: "40kb",
    extended: true,
  }),
);

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

// User routes
app.use("/api/v1/users", userRoutes);

// Start server
const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    console.log("MongoDB connected successfully");

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup error:", error);
  }
};

start();
