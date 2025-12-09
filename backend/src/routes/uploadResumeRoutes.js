// backend/src/routes/uploadResumeRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Resume = require("../models/Resume");
const parseResume = require("../utils/parseResume");

// basic disk storage; swap with S3 if needed
const upload = multer({
  dest: path.join(__dirname, "../../uploads/resumes"),
});

router.post(
  "/upload-resume",
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const filePath = req.file.path;
      const mimeType = req.file.mimetype;

      // your existing logic (textract/pdf-parse/etc.)
      const parsed = await parseResume(filePath);
      // expected shape:
      // { title, sections: [{ key, label, value }], meta }

      const resumeDoc = await Resume.create({
        userId: req.user?.id || null,   // optional
        originalFilePath: filePath,
        mimeType,
        title: parsed.title || req.file.originalname,
        sections: parsed.sections || [],
        meta: parsed.meta || {},
      });

      res.json({
        resumeId: resumeDoc._id.toString(),
        title: resumeDoc.title,
        sections: resumeDoc.sections,
        meta: resumeDoc.meta,
      });
    } catch (err) {
      console.error("upload-resume error:", err);
      res
        .status(500)
        .json({ error: "Failed to parse and store resume." });
    }
  }
);

module.exports = router;