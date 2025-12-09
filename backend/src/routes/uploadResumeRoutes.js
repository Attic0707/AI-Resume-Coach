// backend/src/routes/uploadResumeRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const { parseResumeFromBuffer } = require("../utils/parseResume");
// Use memory storage: we get req.file.buffer directly

router.post("/upload-resume", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const buffer = req.file.buffer;
    const mimeType = req.file.mimetype;
    const originalName = req.file.originalname;

    // Debug log (optional, but helpful in Render logs):
    console.log(
      "[upload-resume] file:", originalName,
      "mime:", mimeType,
      "size:", buffer?.length
    );

    const { title, sections, meta } = await parseResumeFromBuffer( buffer, mimeType, originalName );

    // DEBUG: log what we actually parsed
    console.log("[upload-resume] parsed title:", title);
    console.log(
      "[upload-resume] sample sections:",
      sections
        .slice(0, 4) // just a few, to avoid huge logs
        .map((s) => ({ key: s.key, len: (s.value || "").length }))
    );

    if (!sections || !Array.isArray(sections)) {
      console.error("[upload-resume] invalid sections:", sections);
      return res
        .status(500)
        .json({ error: "Parser did not return valid sections" });
    }

    // ✅ For now, just send parsed data back to the app
    return res.json({ title, sections, meta });
  } catch (err) {
    console.error("upload-resume error:", err);
    return res
      .status(500)
      .json({ error: "Failed to parse resume file" });
  }
});

module.exports = router;
