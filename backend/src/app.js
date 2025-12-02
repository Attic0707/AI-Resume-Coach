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

module.exports = app;
