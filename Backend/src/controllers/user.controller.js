import httpStatus from "http-status";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { User } from "../models/user.model.js";
import { Meeting } from "../models/meeting.model.js";

// Register a new user
const register = async (req, res) => {
  const { name, username, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(httpStatus.FOUND)
        .json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      username,
      password: hashedPassword,
    });
    await newUser.save();

    return res
      .status(httpStatus.CREATED)
      .json({ message: "User registered successfully" });
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: `Error occurred while registering user: ${error.message}`,
    });
  }
};

// Login a user
const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "Username and password are required" });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "Invalid credentials" });
    }

    const token = crypto.randomBytes(20).toString("hex");
    user.token = token;
    await user.save();

    return res
      .status(httpStatus.OK)
      .json({ message: "Login successful", token });
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: `Error occurred while logging in: ${error.message}` });
  }
};

// Add an entry to a user's activity log
const addToActivity = async (req, res) => {
  const { username, activity } = req.body;

  if (!username || !activity) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "Username and activity are required" });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User not found" });
    }

    user.activity.push(activity);
    await user.save();

    return res.status(httpStatus.OK).json({
      message: "Activity added successfully",
      activity: user.activity,
    });
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: `Error occurred while adding activity: ${error.message}`,
    });
  }
};

// Get all activity for a user
const getAllActivity = async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "Username is required" });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User not found" });
    }

    return res.status(httpStatus.OK).json({ activity: user.activity });
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: `Error occurred while fetching activity: ${error.message}`,
    });
  }
};

const getUserHistory = async (req, res) => {
  const { token } = req.query;

  if (!token || typeof token !== "string") {
    return res.status(httpStatus.UNAUTHORIZED).json({
      message: "Token is required",
    });
  }

  try {
    const user = await User.findOne({ token });

    if (!user) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        message: "Invalid token",
      });
    }

    const meetings = await Meeting.find({
      user_id: user.username,
    });

    return res.status(httpStatus.OK).json(meetings);
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: `Error occurred while fetching user history: ${error.message}`,
    });
  }
};

const addToHistory = async (req, res) => {
  const { token, meeting_code } = req.body;

  if (!token || typeof token !== "string") {
    return res.status(httpStatus.UNAUTHORIZED).json({
      message: "Token is required",
    });
  }

  if (!meeting_code || typeof meeting_code !== "string") {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: "Meeting code is required",
    });
  }

  try {
    const user = await User.findOne({ token });

    if (!user) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        message: "Invalid token",
      });
    }

    const newMeeting = new Meeting({
      user_id: user.username,
      meeting_code: meeting_code,
    });

    await newMeeting.save();

    return res.status(httpStatus.CREATED).json({
      message: "Meeting added to history",
      meeting: newMeeting,
    });
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: `Error occurred while adding to history: ${error.message}`,
    });
  }
};

// Get currently logged in user details
const getCurrentUser = async (req, res) => {
  const authorization = req.headers.authorization;

  // Check whether token is available or not
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      message: "Token is required",
    });
  }

  const token = authorization.slice(7).trim();

  if (!token) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      message: "Token is required",
    });
  }

  try {
    // Find user using the login token
    const user = await User.findOne({ token }).select("_id name username");

    // Check whether user exists or not
    if (!user) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        message: "Invalid token",
      });
    }

    // Return logged in user details
    return res.status(httpStatus.OK).json({
      message: "User authenticated successfully",
      user: user,
    });
  } catch (error) {
    console.error("Error verifying user:", error.message);

    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: "Error fetching user details",
    });
  }
};

export {
  register,
  login,
  addToActivity,
  getAllActivity,
  getUserHistory,
  addToHistory,
  getCurrentUser,
};
