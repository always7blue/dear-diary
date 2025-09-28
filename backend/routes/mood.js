import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { pool } from "../db.js";

const router = express.Router();

// GET moods
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { date } = req.query; // opsiyonel: YYYY-MM-DD
    const params = [req.user.id];
    let sql = "SELECT id, user_id, mood, note, day, created_at FROM moodentries WHERE user_id=$1";

    // Eğer tarih filtresi eklenirse
    if (date) {
      sql += " AND day = $2";
      params.push(date);
    }

    sql += " ORDER BY created_at DESC";

    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST mood (upsert - delete old and insert new)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { mood, note, date } = req.body;
    if (!mood) return res.status(400).json({ message: "Mood is required" });

    const targetDate = date ? new Date(date) : new Date();
    const dateStr = targetDate.toISOString().split('T')[0];

    // Önce o günün tüm mood'larını sil
    await pool.query(
      "DELETE FROM moodentries WHERE user_id = $1 AND day = $2",
      [req.user.id, dateStr]
    );

    // Sonra yeni mood'u ekle
    const result = await pool.query(
      "INSERT INTO moodentries (user_id, mood, note, day, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING id, user_id, mood, note, day, created_at",
      [req.user.id, mood, note || null, dateStr, targetDate]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE mood
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      "DELETE FROM moodentries WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Mood not found" });
    }

    res.json({ message: "Mood deleted successfully" });
  } catch (err) {
    console.error("Mood DELETE Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
