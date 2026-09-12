import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Route is working" });
});

export default router;
