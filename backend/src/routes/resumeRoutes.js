// backend/src/routes/resumeRoutes.js
const express = require("express");
const OpenAI = require("openai");
const {
  simpleLocalOptimize,
  simpleJobMatchLocal,
  simpleCoverLetterLocal,
} = require("../utils/fallbacks");

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// /optimize-resume
router.post("/optimize-resume", async (req, res) => { 
    const { resumeText, targetRole, language = "en" } = req.body || {};

    if (!resumeText || typeof resumeText !== "string") {
    return res
      .status(400)
      .json({ error: "resumeText (string) is required" });
    }

  const isTurkish = language === "tr";

  if (!process.env.OPENAI_API_KEY || process.env.MOCK_AI === "1") {
    const optimizedText = simpleLocalOptimize(
      resumeText,
      targetRole,
      language
    );
    return res.json({
      optimizedText,
      source: "local-mock",
    });
  }

  try {
    const systemPrompt = isTurkish
      ? "Sen deneyimli bir kariyer ve CV koçusun. Görevin, kullanıcının CV metnini hedef pozisyona göre daha güçlü, ölçülebilir ve ATS uyumlu hale getirmek. Türkçe yaz, net, profesyonel ve pozisyon odaklı ol."
      : "You are an experienced career and resume coach. Your job is to rewrite the user's resume text to be stronger, more measurable, and ATS-friendly for the target role. Write in clear, professional English and focus on the target role.";

    const userPrompt = `
    Resume text:
    ${resumeText}

    Target role: ${targetRole || (isTurkish ? "Belirtilmedi" : "Not specified")}

    Instructions:
    - Keep the content truthful but improve structure and impact.
    - Use strong action verbs.
    - Highlight measurable outcomes (percentages, numbers) when possible.
    - Make it friendly for ATS (keywords, clear headings).
    - Keep it as one coherent resume text (no explanations, just the improved version).
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.4,
      max_tokens: 900,
    });

    const optimizedText =
      completion.choices?.[0]?.message?.content?.trim() ||
      simpleLocalOptimize(resumeText, targetRole, language);

    res.json({ optimizedText, source: "openai" });
  } catch (err) {
    console.error("Error in /optimize-resume:", err);

    if (err?.code === "insufficient_quota" || err?.status === 429) {
      const optimizedText = simpleLocalOptimize(
        resumeText,
        targetRole,
        language
      );
      return res.status(200).json({
        optimizedText,
        source: "local-fallback",
        warning: isTurkish
          ? "OpenAI kotası doldu, local mock kullanılıyor."
          : "OpenAI quota exceeded, using local fallback.",
      });
    }

    res.status(500).json({
      error: "Server error",
    });
  }
});

// /job-match-resume
router.post("/job-match-resume", async (req, res) => { 
  const { resumeText, jobDescription, language = "en" } = req.body || {};

  if (!resumeText || !jobDescription) {
    return res
      .status(400)
      .json({ error: "resumeText and jobDescription are required" });
  }

  const isTurkish = language === "tr";

  if (!process.env.OPENAI_API_KEY || process.env.MOCK_AI === "1") {
    const tailoredResume = simpleJobMatchLocal(
      resumeText,
      jobDescription,
      language
    );
    return res.json({
      tailoredResume,
      source: "local-mock",
    });
  }

  try {
    const systemPrompt = isTurkish
      ? "Sen deneyimli bir kariyer ve CV koçusun. Görevin, kullanıcının CV metnini belirli bir iş ilanına göre uyarlamak; ilanla uyumu vurgulayan, ölçülebilir ve ATS uyumlu bir CV metni oluşturmak."
      : "You are an experienced career and resume coach. Your job is to tailor the user's resume text to a specific job description, emphasizing alignment, measurable impact, and ATS-friendly phrasing.";

    const userPrompt = `
        User resume:
        ${resumeText}

        Job description:
        ${jobDescription}

        Instructions:
        - Rewrite the resume so that it is clearly tailored to this job description.
        - Emphasize experiences, skills, and keywords that match the job.
        - Keep it truthful; don't invent achievements.
        - Highlight measurable outcomes where possible.
        - Output only the tailored resume text (no explanations or bullet summaries).
        `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.4,
      max_tokens: 1100,
    });

    const tailoredResume =
      completion.choices?.[0]?.message?.content?.trim() ||
      simpleJobMatchLocal(resumeText, jobDescription, language);

    res.json({ tailoredResume, source: "openai" });
  } catch (err) {
    console.error("Error in /job-match-resume:", err);

    if (err?.code === "insufficient_quota" || err?.status === 429) {
      const tailoredResume = simpleJobMatchLocal(
        resumeText,
        jobDescription,
        language
      );
      return res.status(200).json({
        tailoredResume,
        source: "local-fallback",
        warning: isTurkish
          ? "OpenAI kotası doldu, local mock kullanılıyor."
          : "OpenAI quota exceeded, using local fallback.",
      });
    }

    res.status(500).json({ error: "Server error" });
  }
 });

// /cover-letter
router.post("/cover-letter", async (req, res) => { 
      const { resumeText, jobDescription, language = "en" } = req.body || {};

  if (!jobDescription && !resumeText) {
    return res
      .status(400)
      .json({ error: "At least jobDescription or resumeText is required" });
  }

  const isTurkish = language === "tr";

  if (!process.env.OPENAI_API_KEY || process.env.MOCK_AI === "1") {
    const coverLetter = simpleCoverLetterLocal(
      resumeText || "",
      jobDescription || "",
      language
    );
    return res.json({
      coverLetter,
      source: "local-mock",
    });
  }

  try {
    const systemPrompt = isTurkish
      ? "Sen deneyimli bir kariyer koçusun. Görevin, kullanıcının CV'si ve iş ilanına göre, profesyonel ve samimi bir Türkçe ön yazı oluşturmaktır."
      : "You are an experienced career coach. Your job is to write a concise, professional cover letter based on the user's resume and the job description.";

    const userPrompt = `
        User resume (optional):
        ${resumeText || "(not provided)"}

        Job description:
        ${jobDescription || "(not provided)"}

        Instructions:
        - Write a professional cover letter for this role.
        - Use a natural, human tone (no AI disclaimers).
        - Emphasize alignment with the job requirements.
        - Keep it within 3–6 short paragraphs.
        - Output only the cover letter text, no explanations.
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

    const coverLetter =
      completion.choices?.[0]?.message?.content?.trim() ||
      simpleCoverLetterLocal(resumeText || "", jobDescription || "", language);

    res.json({ coverLetter, source: "openai" });
  } catch (err) {
    console.error("Error in /cover-letter:", err);

    if (err?.code === "insufficient_quota" || err?.status === 429) {
      const coverLetter = simpleCoverLetterLocal(
        resumeText || "",
        jobDescription || "",
        language
      );
      return res.status(200).json({
        coverLetter,
        source: "local-fallback",
        warning: isTurkish
          ? "OpenAI kotası doldu, local mock kullanılıyor."
          : "OpenAI quota exceeded, using local fallback.",
      });
    }

    res.status(500).json({ error: "Server error" });
  }
 });

module.exports = router;
