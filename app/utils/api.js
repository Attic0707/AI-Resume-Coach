// app/utils/api.js

// Single source of truth for backend URL
const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? (__DEV__ ? "http://127.0.0.1:4000" : "https://resume-iq-2p17.onrender.com");

// Generic request helper
async function request(path, { method = "GET", body, headers = {} } = {}) {
  const url = `${BASE_URL}${path}`;

  const finalHeaders = {
    "Content-Type": "application/json",
    ...headers,
  };

  try {
    const response = await fetch(url, {
      method,
      headers: finalHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      const error = new Error(
        `API error ${response.status}: ${response.statusText || text}`
      );
      error.status = response.status;
      error.body = text;
      throw error;
    }

    return await response.json();
  } catch (err) {
    console.log("API request error:", err);
    throw err;
  }
}

export async function pingBackend() {
  try {
    const res = await fetch(`${BASE_URL}/`);
    if (!res.ok) throw new Error("Health check failed");
    return true;
  } catch (err) {
    console.log("Backend cold-start? Ping failed:", err);
    return false;
  }
}

// ----- Specific API calls ----- //
export async function optimizeResume({ resumeText, targetRole, language }) {
  return request("/optimize-resume", { method: "POST", body: { resumeText, targetRole, language } });
}

export async function jobMatchResume({ resumeText, jobDescription, language }) {
  return request("/job-match-resume", { method: "POST", body: { resumeText, jobDescription, language } });
}

export async function generateCoverLetter({ resumeText, jobDescription, language }) {
  return request("/cover-letter", { method: "POST", body: { resumeText, jobDescription, language } });
}

export async function analyzeJobDescription({ jobDescription, resumeText, language }) {
  return request("/analyze-job", { method: "POST", body: { jobDescription, resumeText, language } });
}

export async function getInterviewFeedback({ question, answer, language }) {
  return request("/interview-feedback", { method: "POST", body: { question, answer, language } });
}

export async function getInterviewQuestions({ role, level, mode, language }) {
  return request("/interview-questions", { method: "POST", body: { role, level, mode, language } });
}

export async function rewriteBullet({ bulletText, targetRole, language, tone }) {
  return request("/bullet-rewrite", { method: "POST", body: { bulletText, targetRole, language, tone } });
}

export async function optimizeLinkedInSection({ linkedInText, sectionType, targetRole, language }) {
  return request("/optimize-linkedin", { method: "POST", body: { linkedInText, sectionType, targetRole, language } });
}