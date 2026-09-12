import router from "express";
import express from "express";

const router = require("express").Router();

router.route("/login").post((req, res) => {
  // Login logic here
});

router.route("/register").post((req, res) => {
  // Register logic here
});

router.route("/add_to_activity").post((req, res) => {
  // Add to activity logic here
});

router.route("/get_all_activity").get((req, res) => {
  // Get activity logic here
});

export default router;
