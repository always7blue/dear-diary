import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { pool } from "../db.js";

const router = express.Router();

// GET moods
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { date } = req.query; // opsiyonel: YYYY-MM-DD
    const params = [req.user.id];
    let sql = "SELECT id, user_id, mood, note, created_at FROM moodentries WHERE user_id=$1";

    // Eğer tarih filtresi eklenirse
    if (date) {
      sql += " AND DATE(created_at) = $2";
      params.push(date);
    }

    sql += " ORDER BY id DESC";

    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST mood
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { mood, note, date } = req.body;
    if (!mood) return res.status(400).json({ message: "Mood is required" });

    const result = await pool.query(
      "INSERT INTO moodentries (user_id, mood, note, created_at) VALUES ($1, $2, $3, $4) RETURNING id, user_id, mood, note, created_at",
      [req.user.id, mood, note || null, date ? new Date(date) : new Date()]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


export default router;
