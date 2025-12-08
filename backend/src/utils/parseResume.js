// src/utils/parseResume.js
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const textract = require("textract"); // for legacy .doc or fallback

// Promisified textract
function extractWithTextract(buffer, mimeType) {
  return new Promise((resolve, reject) => {
    textract.fromBufferWithMime(
      mimeType || "application/msword",
      buffer,
      (err, text) => {
        if (err) return reject(err);
        resolve(text || "");
      }
    );
  });
}

/**
 * Normalize text:
 * - unify newlines
 * - trim trailing spaces
 * - collapse too many blank lines
 */
function normalizeText(raw = "") {
  let text = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  // trim trailing spaces
  text = text
    .split("\n")
    .map((l) => l.trimEnd())
    .join("\n");

  // collapse 3+ blank lines into max 2
  text = text.replace(/\n{3,}/g, "\n\n");
  return text.trim();
}

/**
 * Naive section header detection based on typical resume patterns.
 * We look for lines that equal known labels (case-insensitive).
 */
const SECTION_DEFS = [
  {
    key: "aboutMe",
    labels: [
      "SUMMARY",
      "PROFESSIONAL SUMMARY",
      "PROFILE",
      "ABOUT ME",
      "CAREER SUMMARY",
      "ABOUT",
    ],
  },
  {
    key: "experience",
    labels: [
      "EXPERIENCE",
      "WORK EXPERIENCE",
      "PROFESSIONAL EXPERIENCE",
      "EMPLOYMENT HISTORY",
      "CAREER HISTORY",
    ],
  },
  {
    key: "education",
    labels: ["EDUCATION", "EDUCATION & TRAINING", "ACADEMIC BACKGROUND"],
  },
  {
    key: "skills",
    labels: ["SKILLS", "KEY SKILLS", "TECHNICAL SKILLS", "CORE SKILLS"],
  },
  {
    key: "projects",
    labels: ["PROJECTS", "PERSONAL PROJECTS", "SELECTED PROJECTS"],
  },
  {
    key: "languages",
    labels: ["LANGUAGES", "LANGUAGE SKILLS"],
  },
  {
    key: "expertise",
    labels: ["AREAS OF EXPERTISE", "EXPERTISE"],
  },
  {
    key: "certificates",
    labels: [
      "CERTIFICATES",
      "CERTIFICATIONS",
      "PROFESSIONAL CERTIFICATIONS",
    ],
  },
  {
    key: "publishes",
    labels: [
      "PUBLICATIONS",
      "PUBLICATIONS & AWARDS",
      "AWARDS",
      "HONORS & AWARDS",
      "AWARDS & HONORS",
    ],
  },
  {
    key: "referrals",
    labels: ["REFERENCES", "REFERRALS"],
  },
  {
    key: "contact",
    labels: ["CONTACT", "CONTACT DETAILS", "CONTACT INFORMATION"],
  },
];

/**
 * Find likely name + headline from the very top of the resume.
 */
function extractHeaderNameAndHeadline(lines) {
  // first 4–6 lines before a major section usually contain:
  // Name, Headline, Contact, maybe location
  const slice = lines.slice(0, 10).filter((l) => l.trim().length > 0);

  if (!slice.length) return { name: "", headline: "" };

  const name = slice[0].trim();

  // Heuristic: second line as headline if it's not a classic section header
  const second = slice[1] || "";
  const upperSecond = second.toUpperCase().trim();
  const looksLikeSectionHeader = SECTION_DEFS.some((s) =>
    s.labels.includes(upperSecond)
  );

  const headline = looksLikeSectionHeader ? "" : second.trim();

  return { name, headline };
}

/**
 * Attempt to infer a contact block:
 * - either from a "CONTACT" section
 * - or from top-of-document lines with email/phone
 */
function inferContactSection(allLines, explicitContactBlock) {
  if (explicitContactBlock && explicitContactBlock.trim()) {
    return explicitContactBlock.trim();
  }

  const emailRegex = /@.+\./i;
  const phoneRegex = /(\+\d{1,3}\s*)?(\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}/;

  const top = allLines.slice(0, 15);
  const contactLines = top.filter(
    (l) =>
      emailRegex.test(l) ||
      phoneRegex.test(l) ||
      /linkedin\.com/i.test(l) ||
      /github\.com/i.test(l) ||
      /portfolio/i.test(l)
  );

  if (!contactLines.length) return "";

  return contactLines.join("\n");
}

/**
 * Parse section blocks based on SECTION_DEFS
 */
function splitIntoSections(text) {
  const lines = text.split("\n");

  // mark section headers with their indices
  const headers = [];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].trim();
    if (!raw) continue;
    const upper = raw.toUpperCase();

    for (const def of SECTION_DEFS) {
      if (def.labels.includes(upper)) {
        headers.push({
          index: i,
          key: def.key,
          label: raw,
        });
        break;
      }
    }
  }

  // If no headers found, treat entire body as aboutMe
  if (!headers.length) {
    return { aboutMe: text };
  }

  // sort by index just in case
  headers.sort((a, b) => a.index - b.index);

  const sections = {};

  for (let h = 0; h < headers.length; h++) {
    const current = headers[h];
    const next = headers[h + 1];

    const start = current.index + 1; // content begins after header line
    const end = next ? next.index : lines.length;

    const blockLines = lines.slice(start, end);
    const blockText = blockLines.join("\n").trim();

    if (blockText) {
      if (!sections[current.key]) {
        sections[current.key] = blockText;
      } else {
        // in case the same section appears multiple times, append
        sections[current.key] += `\n\n${blockText}`;
      }
    }
  }

  // name/headline detection
  const { name, headline } = extractHeaderNameAndHeadline(lines);

  // contact inference (explicit or guessed)
  const contact = inferContactSection(lines, sections.contact || "");

  return {
    name: name || "",
    headline: headline || "",
    ...sections,
    contact,
  };
}

/**
 * Main parse function:
 * - Detects file type
 * - Extracts raw text
 * - Normalizes & splits into sections
 * - Returns { title, sections[], meta }
 */
async function parseResumeFromBuffer(buffer, mimeType, originalName) {
  if (!buffer) {
    throw new Error("No file buffer provided to parseResumeFromBuffer");
  }

  let rawText = "";
  let meta = {
    mimeType: mimeType || "unknown",
    originalName: originalName || "",
    pageCount: null,
    wordCount: null,
    charCount: null,
  };

  const lowerMime = (mimeType || "").toLowerCase();
  const lowerName = (originalName || "").toLowerCase();

  try {
    if (lowerMime.includes("pdf") || lowerName.endsWith(".pdf")) {
      const data = await pdfParse(buffer);
      rawText = data.text || "";
      meta.pageCount = data.numpages || null;
    } else if (
      lowerMime.includes(
        "vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) ||
      lowerName.endsWith(".docx")
    ) {
      const { value } = await mammoth.extractRawText({ buffer });
      rawText = value || "";
    } else if (
      lowerMime.includes("msword") ||
      lowerName.endsWith(".doc")
    ) {
      rawText = await extractWithTextract(buffer, mimeType);
    } else {
      // Fallback: try textract anyway
      rawText = await extractWithTextract(buffer, mimeType);
    }
  } catch (err) {
    console.error("[parseResumeFromBuffer] extract error:", err);
    throw new Error("Could not extract text from file");
  }

  const text = normalizeText(rawText);

  const words = text.split(/\s+/g).filter(Boolean);
  meta.wordCount = words.length;
  meta.charCount = text.length;

  // Use heuristics to split into sections
  const sectionMap = splitIntoSections(text);

  // Map into the shape the mobile app expects: { key, label, value }
  const labelByKey = {
    name: "Full Name",
    headline: "Job Title / Headline",
    aboutMe: "About Me",
    contact: "Contact Info",
    experience: "Work Experience",
    education: "Education",
    skills: "Skills",
    projects: "Projects",
    languages: "Languages",
    expertise: "Expertise",
    certificates: "Certificates",
    publishes: "Published Works / Rewards",
    referrals: "Referrals",
  };

  const sections = Object.keys(labelByKey).map((key) => ({
    key,
    label: labelByKey[key],
    value: sectionMap[key] || "",
  }));

  const titleBase =
    sectionMap.name && sectionMap.headline
      ? `${sectionMap.name} – ${sectionMap.headline}`
      : sectionMap.name || originalName || "Imported Resume";

  return {
    title: titleBase,
    sections,
    meta,
  };
}

module.exports = {
  parseResumeFromBuffer,
};