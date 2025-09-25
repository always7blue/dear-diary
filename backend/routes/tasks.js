import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { pool } from "../db.js";

const router = express.Router();

// GET tasks
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { date } = req.query;
    const params = [req.user.id];
    let sql = "SELECT id, user_id, text, done, day, created_at FROM tasks WHERE user_id=$1";

    if (date) {
      sql += " AND day=$2";
      params.push(date);
    }

    sql += " ORDER BY id DESC";

    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Tasks GET Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST task
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { text, date } = req.body; // frontend'den gelecek date
    if (!text) return res.status(400).json({ message: "Task text required" });

    const day = date ? new Date(date) : new Date(); // bugünün tarihini al
    const dayString = day.toISOString().split("T")[0]; // YYYY-MM-DD formatı

    const result = await pool.query(
      "INSERT INTO tasks (user_id, text, day, created_at) VALUES ($1, $2, $3, $4) RETURNING id, user_id, text, day, created_at",
      [req.user.id, text, dayString, new Date()]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Tasks POST Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});



// PATCH toggle done
router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "UPDATE tasks SET done = NOT done WHERE id=$1 AND user_id=$2 RETURNING id, user_id, text, done, day",
      [id, req.user.id]
    );

    if (!result.rows[0]) return res.status(404).json({ message: "Not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Tasks PATCH Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE task
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM tasks WHERE id=$1 AND user_id=$2", [id, req.user.id]);
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("Tasks DELETE Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
