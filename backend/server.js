import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import authRouter from "./routes/auth.js";
import moodRouter from "./routes/mood.js";
import tasksRouter from "./routes/tasks.js";
import journalsRouter from "./routes/journals.js";
import profileRouter from "./routes/profile.js";
import googleAuthRouter from "./routes/googleAuth.js";
import { pool } from "./db.js";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));
app.use(express.static('public'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use("/api/auth", authRouter);
app.use("/api/auth", googleAuthRouter);
app.use("/api/mood", moodRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/journals", journalsRouter);
app.use("/api/profile", profileRouter);

// Serve React app for all other routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// initialize database tables if not exist (PgAdmin tablolarına uyumlu)
async function initDb() {
  const createUsers = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password VARCHAR(200) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`;

  const createMoods = `
    CREATE TABLE IF NOT EXISTS moodentries (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      mood VARCHAR(20),
      note TEXT,
      day DATE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );`;

  // Tasks ve Journals için benzer şekilde:
  const createTasks = `
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      text TEXT NOT NULL,
      done BOOLEAN NOT NULL DEFAULT FALSE,
      day DATE NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );`;

  const createJournals = `
    CREATE TABLE IF NOT EXISTS journals (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      day DATE NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );`;

  await pool.query(createUsers);
  await pool.query(createMoods);
  await pool.query(createTasks);
  await pool.query(createJournals);
  
  // Mevcut tablolara day kolonu ekle (eğer yoksa)
  try {
    await pool.query("ALTER TABLE moodentries ADD COLUMN IF NOT EXISTS day DATE");
    await pool.query("UPDATE moodentries SET day = DATE(created_at) WHERE day IS NULL");
    console.log("Day column added to moodentries if needed");
  } catch (err) {
    console.log("Day column already exists or error:", err.message);
  }
}

initDb().catch(err => console.error("DB init failed", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



