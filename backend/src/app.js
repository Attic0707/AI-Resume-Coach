// backend/src/app.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const rateLimit = require("express-rate-limit");

const resumeRoutes = require("./routes/resumeRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const rewriteRoutes = require("./routes/rewriteRoutes");

const templateRoutes = require("./routes/templateRoutes");
const uploadResumeRoutes = require("./routes/uploadResumeRoutes");

const app = express();

app.set("trust proxy", 1); // or true
app.use(cors());
app.use(express.json());

// ----- Rate limiting for AI endpoints -----
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,             // 30 AI calls per minute per IP
  standardHeaders: true,
  legacyHeaders: false
});

// Apply limiter *before* the routes
app.use("/optimize-resume", aiLimiter);
app.use("/job-match-resume", aiLimiter);
app.use("/cover-letter", aiLimiter);
app.use("/interview-feedback", aiLimiter);
app.use("/interview-questions", aiLimiter);
app.use("/bullet-rewrite", aiLimiter);
app.use("/analyze-job", aiLimiter);
app.use("/optimize-linkedin", aiLimiter);

app.use("/about-me", aiLimiter);
app.use("/skills", aiLimiter);
app.use("/projects", aiLimiter);
app.use("/expertise", aiLimiter);
app.use("/publishes", aiLimiter);
app.use("/work-details", aiLimiter);
app.use("/edu-details", aiLimiter);

app.use("/upload-resume", aiLimiter);

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "AI Resume Coach backend running" });
});

// Route groups
app.use("/", resumeRoutes);
app.use("/", interviewRoutes);
app.use("/", rewriteRoutes);
app.use("/", templateRoutes);
app.use("/", uploadResumeRoutes);

module.exports = app;
