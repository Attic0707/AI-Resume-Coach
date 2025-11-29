// backend/src/app.js
import express, { json } from "express";
import cors from "cors";
require("dotenv").config();

import resumeRoutes from "./routes/resumeRoutes";
import interviewRoutes from "./routes/interviewRoutes";

const app = express();

app.use(cors());
app.use(json());

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "AI Resume Coach backend running" });
});

// Route groups
app.use("/", resumeRoutes);
app.use("/", interviewRoutes);

export default app;