import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";

import authRouter from "./routes/auth.js";
import moodRouter from "./routes/mood.js";
import tasksRouter from "./routes/tasks.js";
import journalsRouter from "./routes/journals.js";
import profileRouter from "./routes/profile.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(bodyParser.json());

// serve uploaded files
app.use('/uploads', express.static('uploads'));

app.use("/auth", authRouter);
app.use("/mood", moodRouter);
app.use("/tasks", tasksRouter);
app.use("/journals", journalsRouter);
app.use("/profile", profileRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));








