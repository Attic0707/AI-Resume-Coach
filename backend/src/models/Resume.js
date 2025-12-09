// backend/src/models/Resume.js
const mongoose = require("mongoose");

const SectionSchema = new mongoose.Schema({
  key: String,      // "experience", "education", etc.
  label: String,    // "Work Experience"
  value: String,    // raw text
});

const ResumeSchema = new mongoose.Schema(
  {
    userId: { type: String, required: false }, // or ObjectId if you have auth
    originalFilePath: String,                  // where the uploaded file is stored
    mimeType: String,
    title: String,
    sections: [SectionSchema],
    meta: {
      pageCount: Number,
      wordCount: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resume", ResumeSchema);
