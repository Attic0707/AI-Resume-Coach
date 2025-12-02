// app/utils/api.js

// 👉 If you're on iOS SIMULATOR:
const API_BASE = "http://127.0.0.1:4000";

// 👉 If you test on a REAL DEVICE on same Wi-Fi as your Mac,
// replace with your Mac's local IP, e.g.:
// const API_BASE = "http://192.168.1.106:4000";

async function request(path, { method = "GET", body, headers = {} } = {}) {
  const url = `${API_BASE}${path}`;

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
    // Network or parsing error
    console.log("API request error:", err);
    throw err;
  }
}

// ----- Specific API calls ----- //

export async function optimizeResume({ resumeText, targetRole, language }) {
  return request("/optimize-resume", {
    method: "POST",
    body: {
      resumeText,
      targetRole,
      language,
    },
  });
}

// We'll use these for Job Match backend next:
export async function jobMatchResume({ resumeText, jobDescription, language }) {
  return request("/job-match-resume", {
    method: "POST",
    body: { resumeText, jobDescription, language },
  });
}

export async function generateCoverLetter({
  resumeText,
  jobDescription,
  language,
}) {
  return request("/cover-letter", {
    method: "POST",
    body: { resumeText, jobDescription, language },
  });
}

export async function getInterviewFeedback({ question, answer, language }) {
  return request("/interview-feedback", {
    method: "POST",
    body: { question, answer, language },
  });
}

export async function getInterviewQuestions({ role, level, mode, language }) {
  return request("/interview-questions", {
    method: "POST",
    body: { role, level, mode, language },
  });
}


export async function rewriteBullet({ bulletText, targetRole, language, tone }) {
  return request("/bullet-rewrite", {
    method: "POST",
    body: { bulletText, targetRole, language, tone }
  });
}