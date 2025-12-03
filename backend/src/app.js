// backend/src/app.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const resumeRoutes = require("./routes/resumeRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const rewriteRoutes = require("./routes/rewriteRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "AI Resume Coach backend running" });
});

// Route groups
app.use("/", resumeRoutes);
app.use("/", interviewRoutes);
app.use("/", rewriteRoutes);

import rateLimit from "express-rate-limit";

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,             // 30 AI calls per minute per IP
});

app.use("/optimize-resume", aiLimiter);
app.use("/job-match-resume", aiLimiter);
app.use("/cover-letter", aiLimiter);
app.use("/interview-feedback", aiLimiter);
app.use("/interview-questions", aiLimiter);

module.exports = app;
