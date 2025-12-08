// src/routes/uploadResumeRoutes.js
const express = require("express");
const multer = require("multer");
const { parseResumeFromBuffer } = require("../utils/parseResume");

const router = express.Router();

// store file in memory as Buffer (we don't need to write to disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024, // 8 MB limit, adjust as needed
  },
});

router.post(
  "/upload-resume",
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded." });
      }

      const { buffer, mimetype, originalname } = req.file;

      const parsed = await parseResumeFromBuffer(
        buffer,
        mimetype,
        originalname
      );

      // parsed = { title, sections, meta }
      return res.json(parsed);
    } catch (err) {
      console.error("[/api/upload-resume] error:", err);
      return res.status(500).json({
        error: "Could not process this resume file.",
      });
    }
  }
);

module.exports = router;