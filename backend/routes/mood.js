import express from "express";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

let moods = [];

// GET moods
router.get("/", authMiddleware, (req, res) => {
  const { date } = req.query; // YYYY-MM-DD
  let userMoods = moods.filter((m) => m.userId === req.user.id);
  if (date) {
    userMoods = userMoods.filter((m) => m.day === date);
  }
  res.json(userMoods);
});

// POST mood
router.post("/", authMiddleware, (req, res) => {
  const { mood, note, date } = req.body;
  if (!mood) return res.status(400).json({ message: "Mood is required" });

  const day = date || new Date().toISOString().slice(0,10);
  const newMood = {
    id: Date.now(),
    userId: req.user.id,
    mood,
    note,
    day,
    date: `${day}T00:00:00.000Z`,
  };

  moods.push(newMood);
  res.json(newMood);
});

export default router;

