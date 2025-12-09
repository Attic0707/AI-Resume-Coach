// backend/src/routes/uploadResumeRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Resume = require("../models/Resume");
const { parseResumeFromBuffer } = require("../utils/parseResume");

// Store uploaded files on disk so we have an originalFilePath
const upload = multer({
  dest: path.join(__dirname, "../../uploads/resumes"),
});

router.post("/upload-resume", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // --- File info from multer ---
    const filePath = req.file.path;            // e.g. /opt/render/project/.../uploads/resumes/xyz
    const mimeType = req.file.mimetype;
    const originalName = req.file.originalname;

    // --- Read file into buffer and parse ---
    const buffer = fs.readFileSync(filePath);

    const parsed = await parseResumeFromBuffer(
      buffer,
      mimeType,
      originalName
    );

    const { title, sections, meta } = parsed;

    if (!sections || !Array.isArray(sections)) {
      return res
        .status(500)
        .json({ error: "Parser did not return valid sections" });
    }

    // --- Persist in Mongo so we can update sections later ---
    const resumeDoc = await Resume.create({
      userId: req.user?.id || null, // optional for now; can be null
      originalFilePath: filePath,
      mimeType,
      title: title || originalName,
      sections: sections || [],
      meta: meta || {},
    });

    // --- Respond to mobile app ---
    return res.json({
      resumeId: resumeDoc._id.toString(),
      title: resumeDoc.title,
      sections: resumeDoc.sections,
      meta: resumeDoc.meta,
    });
  } catch (err) {
    console.error("upload-resume error:", err);
    return res
      .status(500)
      .json({ error: "Failed to parse and store resume." });
  }
});

module.exports = router;
