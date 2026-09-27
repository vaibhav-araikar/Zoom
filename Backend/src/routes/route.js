import express from "express";

import {
  register,
  login,
  addToActivity,
  getAllActivity,
} from "../controllers/user.controller.js";

const router = express.Router();

// Test route
router.get("/", (req, res) => {
  res.json({ message: "Route is working" });
});

// Register
router.post("/register", register);

// Login
router.post("/login", login);

// Add activity
router.post("/add_activity", addToActivity);

// Get activity
router.get("/get_activity", getAllActivity);

export default router;
