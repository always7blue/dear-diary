import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";

import authRouter from "./routes/auth.js";
import moodRouter from "./routes/mood.js";
import tasksRouter from "./routes/tasks.js";
import journalsRouter from "./routes/journals.js";
import profileRouter from "./routes/profile.js";
import { pool } from "./db.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

app.use("/auth", authRouter);
app.use("/mood", moodRouter);
app.use("/tasks", tasksRouter);
app.use("/journals", journalsRouter);
app.use("/profile", profileRouter);

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
}

initDb().catch(err => console.error("DB init failed", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



