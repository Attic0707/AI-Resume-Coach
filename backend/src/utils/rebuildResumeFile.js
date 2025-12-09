// backend/src/utils/rebuildResumeFile.js
const fs = require("fs");
const path = require("path");
const { Document, Packer, Paragraph, HeadingLevel } = require("docx");

async function rebuildResumeFileFromSections(resumeDoc) {
  const { sections, title, originalFilePath } = resumeDoc;

  const sectionByKey = {};
  sections.forEach((s) => {
    sectionByKey[s.key] = s.value || "";
  });

  const children = [];

  if (sectionByKey.name) {
    children.push(
      new Paragraph({
        text: sectionByKey.name,
        heading: HeadingLevel.HEADING_1,
      })
    );
  }

  if (sectionByKey.headline) {
    children.push(
      new Paragraph({
        text: sectionByKey.headline,
        spacing: { after: 200 },
      })
    );
  }

  const addSection = (label, key) => {
    const value = sectionByKey[key];
    if (!value || !value.trim()) return;

    children.push(
      new Paragraph({
        text: label.toUpperCase(),
        heading: HeadingLevel.HEADING_2,
      })
    );

    value.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      children.push(
        new Paragraph({
          text: trimmed,
        })
      );
    });
  };

  addSection("Profile", "aboutMe");
  addSection("Experience", "experience");
  addSection("Education", "education");
  addSection("Skills", "skills");
  addSection("Projects", "projects");
  addSection("Languages", "languages");
  addSection("Expertise", "expertise");
  addSection("Certificates", "certificates");
  addSection("Publications & Awards", "publishes");
  addSection("Referrals", "referrals");

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);

  const ext = ".docx";
  const newPath = originalFilePath.endsWith(ext)
    ? originalFilePath
    : originalFilePath + ext;

  fs.writeFileSync(newPath, buffer);

  // Optionally store this custom path as `resumeDoc.generatedFilePath`
  resumeDoc.generatedFilePath = newPath;
  await resumeDoc.save();
}

module.exports = { rebuildResumeFileFromSections };
