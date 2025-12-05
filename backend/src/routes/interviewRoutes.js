// backend/src/routes/interviewRoutes.js
const express = require("express");
const OpenAI = require("openai");
const { assessCareerInput } = require("../utils/guardrails");
const { simpleInterviewFeedbackLocal, simpleInterviewQuestionsLocal, } = require("../utils/fallbacks");
const router = express.Router();

// Only instantiate OpenAI when we actually have a key AND not in mock mode
let openai = null;
if (process.env.OPENAI_API_KEY && process.env.MOCK_AI !== "1") {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, });
}

// /interview-feedback
router.post("/interview-feedback", async (req, res) => {
  const { question, answer, language = "en" } = req.body || {};

  if (!answer || typeof answer !== "string") {
    return res
      .status(400)
      .json({ error: "answer (string) is required" });
  }

  if (answer.length > 500) {
    return res.status(400).json({
      error: "Answer is too long. Maximum allowed is 500 characters."
    });
  }

  // 🔒 Guardrails: abuse / out-of-scope check
  const guard = assessCareerInput({ question: question || "", answer: answer || "" });
  if (!guard.ok) {
    return res.status(400).json({
      error: guard.message,
      reason: guard.reason,
    });
  }

  const isTurkish = language === "tr";

  // If no OpenAI client → use local mock
  if (!openai) {
    const feedback = simpleInterviewFeedbackLocal( question || "", answer, language );
    return res.json({ feedback, score: 7, source: "local-mock", });
  }

  try {
    const systemPrompt = isTurkish
      ? "Sen deneyimli bir mülakat koçusun. Görevin, adayın verdiği cevabı değerlendirip güçlü yönlerini, geliştirme alanlarını ve net bir puanlamayı (1–10 arası) STAR (Situation, Task, Action, Result) çerçevesinde sunmaktır."
      : "You are an experienced interview coach. Your job is to evaluate the candidate's answer using the STAR framework (Situation, Task, Action, Result), highlighting strengths, areas for improvement, and giving a final score from 1 to 10.";

    const userPrompt = `
      Interview question:
      ${question || "(not provided)"}

      Candidate answer:
      ${answer}

      Instructions:
      - Briefly restate what the candidate is trying to say.
      - Evaluate the answer using STAR (Situation, Task, Action, Result).
      - Highlight 3–5 strengths.
      - Highlight 3–5 specific areas to improve.
      - Provide concrete suggestions on how to make this answer stronger next time.
      - At the end, give a score from 1 to 10 in the format: "Score: X/10".
      - Respond in ${isTurkish ? "Turkish" : "English"}.
      `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.5,
      max_tokens: 900,
    });

    const fullFeedback =
      completion.choices?.[0]?.message?.content?.trim() ||
      simpleInterviewFeedbackLocal(question || "", answer, language);

    let score = null;
    const match = fullFeedback.match(/Score:\s*(\d+)\s*\/\s*10/i);
    if (match) {
      score = parseInt(match[1], 10);
    }

    res.json({
      feedback: fullFeedback,
      score,
      source: "openai",
    });
  } catch (err) {
    console.error("Error in /interview-feedback:", err);

    if (err?.code === "insufficient_quota" || err?.status === 429) {
      const feedback = simpleInterviewFeedbackLocal( question || "", answer, language );
      return res.status(200).json({ feedback, score: 7, source: "local-fallback",
        warning: isTurkish ? "OpenAI kotası doldu, local mock kullanılıyor." : "OpenAI quota exceeded, using local fallback.", });
    }

    res.status(500).json({ error: "Server error" });
  }
});

// /interview-questions
router.post("/interview-questions", async (req, res) => {
  const { role, level, mode = "quick", language = "en" } = req.body || {};
  const isTurkish = language === "tr";

  if (role.length > 100) {
    return res.status(400).json({
      error: "Role is too long. Maximum allowed is 100 characters."
    });
  }

  // 🔒 Guardrails: abuse / out-of-scope check
  const guard = assessCareerInput({ role: role || "" });
  if (!guard.ok) {
    return res.status(400).json({
      error: guard.message,
      reason: guard.reason,
    });
  }

  // If no OpenAI client → use local mock
  if (!openai) {
    const questions = simpleInterviewQuestionsLocal( role || "", level, mode, language );
    return res.json({ questions, source: "local-mock" });
  }

  try {
    const systemPrompt = isTurkish
      ? "Sen deneyimli bir mülakat koçusun. Görevin, verilen rol, seviye ve oturum türüne göre uygun davranışsal ve teknik sorular üretmektir."
      : "You are an experienced interview coach. Your job is to generate realistic interview questions for a given role, level, and session type.";

    const userPrompt = `
      Role: ${role || "(not specified)"}
      Level: ${level || "(not specified)"}
      Mode (session length): ${mode || "quick"}

      Instructions:
      - Generate interview questions tailored to this role and level.
      - Include a mix of behavioral and role-specific questions.
      - Respond as plain text, one question per line.
      - Do not number them, just one question per line.
      - Language: ${isTurkish ? "Turkish" : "English"}.
      `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 600,
    });

    const raw = completion.choices?.[0]?.message?.content?.trim() || "";

    let questions = raw
      .split("\n")
      .map((q) => q.replace(/^\d+[\).\s-]+/, "").trim())
      .filter(Boolean);

    const desiredCount = mode === "deep" ? 10 : 5;
    if (questions.length > desiredCount) {
      questions = questions.slice(0, desiredCount);
    }

    if (!questions.length) {
      questions = simpleInterviewQuestionsLocal( role || "", level, mode, language );
      return res.json({ questions, source: "local-fallback", });
    }

    res.json({ questions, source: "openai" });
  } catch (err) {
    console.error("Error in /interview-questions:", err);

    const questions = simpleInterviewQuestionsLocal( role || "", level, mode, language );
    res.status(200).json({ questions, source: "local-fallback", });
  }
});

module.exports = router;