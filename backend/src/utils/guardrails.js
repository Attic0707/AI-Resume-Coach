// backend/src/utils/guardrails.js

/**
 * Very lightweight guardrails to prevent obviously harmful
 * or clearly out-of-scope content from being sent to OpenAI.
 *
 * This is NOT a full moderation system, just a first safety layer.
 */

const ABUSE_PATTERNS = [
  /suicide/i,
  /kill myself/i,
  /kill (him|her|them)/i,
  /murder/i,
  /terrorist/i,
  /bomb/i,
  /shoot(?:ing)?/i,
  /massacre/i,
  /genocide/i,
  /child\s+(?:porn|abuse|sexual)/i,
  /rape/i,
];

const EXPLICIT_NSFw_PATTERNS = [
  /porn/i,
  /xxx/i,
  /erotic/i,
  /sex story/i,
  /sexual fantasy/i,
];

const CLEARLY_NON_CAREER_PATTERNS = [
  /\bpoem\b/i,
  /\bpoetry\b/i,
  /\bsong\b/i,
  /\blyrics\b/i,
  /\bnovel\b/i,
  /\bshort story\b/i,
  /\bscript\b/i,
  /\bfanfic\b/i,
];

// keywords that *suggest* the text is actually career-related
const CAREER_HINTS = [
  /\bresume\b/i,
  /\bcv\b/i,
  /\bcover letter\b/i,
  /\bjob\b/i,
  /\brole\b/i,
  /\bposition\b/i,
  /\bexperience\b/i,
  /\bmanager\b/i,
  /\bdeveloper\b/i,
  /\bengineer\b/i,
  /\bskills\b/i,
  /\bproject\b/i,
];

/**
 * Returns true if text matches any pattern in the given list.
 */
function matchesAny(text, patterns) {
  if (!text || typeof text !== "string") return false;
  return patterns.some((re) => re.test(text));
}

/**
 * Check if combined user input is clearly abusive / disallowed.
 */
function isAbusiveContent(text) {
  if (!text) return false;
  if (matchesAny(text, ABUSE_PATTERNS)) return true;
  if (matchesAny(text, EXPLICIT_NSFw_PATTERNS)) return true;
  return false;
}

/**
 * Check if user is obviously trying to use the app for
 * general creative writing (poems, novels, etc) instead
 * of resume / interview / career content.
 *
 * We only flag if:
 *  - we see creative-writing hints AND
 *  - we do NOT see any career hints
 */
function isClearlyOutOfScope(text) {
  if (!text) return false;

  const hasCreative = matchesAny(text, CLEARLY_NON_CAREER_PATTERNS);
  const hasCareer = matchesAny(text, CAREER_HINTS);

  return hasCreative && !hasCareer;
}

/**
 * Main helper: pass in *all relevant user text fields*.
 *
 * Example:
 *   assessCareerInput({ resumeText, jobDescription, targetRole });
 */
function assessCareerInput(fields = {}) {
  console.log('CHECK : ', fields);
  const combined = Object.values(fields)
    .filter((v) => typeof v === "string" && v.trim().length > 0)
    .join("\n")
    .trim();

  if (!combined) {
    return {
      ok: false,
      reason: "EMPTY",
      message:
        "No text provided. Please paste your resume, job description or interview content.",
    };
  }

  if (isAbusiveContent(combined)) {
    return {
      ok: false,
      reason: "ABUSIVE",
      message:
        "This tool can only be used for career-related content (resumes, job descriptions, interviews). Your input appears to contain harmful or disallowed content.",
    };
  }

  if (isClearlyOutOfScope(combined)) {
    return {
      ok: false,
      reason: "OUT_OF_SCOPE",
      message:
        "This feature is only for resumes, job descriptions and interview preparation. It can't be used for poems, stories, lyrics or unrelated creative writing.",
    };
  }

  return { ok: true };
}

module.exports = {
  assessCareerInput,
};
