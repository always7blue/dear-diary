import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { pool } from "../db.js";

const router = express.Router();

// GET journals
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { date } = req.query;
    const params = [req.user.id];
    let sql = "SELECT id, user_id, content, to_char(day,'YYYY-MM-DD') as day, created_at FROM journals WHERE user_id=$1";

    if (date) {
      sql += " AND day=$2";
      params.push(date);
    }

    sql += " ORDER BY id DESC";

    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Journals GET Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST journal
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { content, date } = req.body;
    if (!content) return res.status(400).json({ message: "Content required" });

    const day = date ? new Date(date) : new Date();
    const dayString = day.toISOString().split("T")[0];

    const result = await pool.query(
      "INSERT INTO journals (user_id, content, day, created_at) VALUES ($1, $2, $3, $4) RETURNING id, user_id, content, day, created_at",
      [req.user.id, content, dayString, new Date()]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Journals POST Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});



// DELETE journal
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM journals WHERE id=$1 AND user_id=$2", [id, req.user.id]);
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("Journals DELETE Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
