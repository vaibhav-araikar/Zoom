import express from "express";
import {
  login,
  register,
  addToHistory,
  getUserHistory,
  getCurrentUser,
  logout,
} from "../controllers/user.controller.js";

const router = express.Router();

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/add_to_history").post(addToHistory);
router.route("/history").get(getUserHistory);

// Verify login token and get user details
router.route("/me").get(getCurrentUser);

// Logout the current user
router.route("/logout").post(logout);

export default router;
