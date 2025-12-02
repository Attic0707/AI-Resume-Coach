// backend/src/routes/resumeRoutes.js
const express = require("express");
const OpenAI = require("openai");
const { simpleLocalOptimize, simpleJobMatchLocal, simpleCoverLetterLocal, simpleJobAnalysisLocal } = require("../utils/fallbacks");
const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, });

// /optimize-resume
router.post("/optimize-resume", async (req, res) => {
  const { resumeText, targetRole, language = "en" } = req.body || {};

  if (!resumeText || typeof resumeText !== "string") {
    return res
      .status(400)
      .json({ error: "resumeText (string) is required" });
  }

  if (resumeText.length > 20000) {
    return res.status(400).json({
      error: "Resume is too long. Maximum allowed is 20,000 characters."
    });
  }

  if (targetRole && targetRole.length > 100) {
    return res.status(400).json({
      error: "Target Role is too long. Maximum allowed is 100 characters."
    });
  }

  const isTurkish = language === "tr";

  if (!process.env.OPENAI_API_KEY || process.env.MOCK_AI === "1") {
    const optimizedText = simpleLocalOptimize( resumeText, targetRole, language );
    return res.json({ optimizedText, source: "local-mock", });
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
      const optimizedText = simpleLocalOptimize( resumeText, targetRole, language );
      return res.status(200).json({ optimizedText, source: "local-fallback", 
        warning: isTurkish ? "OpenAI kotası doldu, local mock kullanılıyor." : "OpenAI quota exceeded, using local fallback.", });
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

  if (resumeText.length > 20000) {
    return res.status(400).json({
      error: "Resume is too long. Maximum allowed is 20,000 characters."
    });
  }

  if (jobDescription.length > 20000) {
    return res.status(400).json({
      error: "Job Description is too long. Maximum allowed is 20,000 characters."
    });
  }

  const isTurkish = language === "tr";

  if (!process.env.OPENAI_API_KEY || process.env.MOCK_AI === "1") {
    const tailoredResume = simpleJobMatchLocal( resumeText, jobDescription, language );
    return res.json({ tailoredResume, source: "local-mock", });
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
      return res.status(200).json({ tailoredResume, source: "local-fallback",
        warning: isTurkish ? "OpenAI kotası doldu, local mock kullanılıyor." : "OpenAI quota exceeded, using local fallback.", });
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
    const coverLetter = simpleCoverLetterLocal( resumeText || "", jobDescription || "", language );
    return res.json({ coverLetter, source: "local-mock", });
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
      simpleCoverLetterLocal( resumeText || "", jobDescription || "", language );

    res.json({ coverLetter, source: "openai" });
  } catch (err) {
    console.error("Error in /cover-letter:", err);

    if (err?.code === "insufficient_quota" || err?.status === 429) {
      const coverLetter = simpleCoverLetterLocal( resumeText || "", jobDescription || "", language );
      return res.status(200).json({ coverLetter, source: "local-fallback",
        warning: isTurkish ? "OpenAI kotası doldu, local mock kullanılıyor." : "OpenAI quota exceeded, using local fallback.", });
    }

    res.status(500).json({ error: "Server error" });
  }
});

// /analyze-job
router.post("/analyze-job", async (req, res) => {
  const { jobDescription, resumeText = "", language = "en" } = req.body || {};

  if (!jobDescription || typeof jobDescription !== "string") {
    return res
      .status(400)
      .json({ error: "jobDescription (string) is required" });
  }

  if (jobDescription.length > 20000) {
    return res.status(400).json({
      error: "Job Description is too long. Maximum allowed is 20,000 characters.",
    });
  }

  if (resumeText && resumeText.length > 20000) {
    return res.status(400).json({
      error: "Resume is too long. Maximum allowed is 20,000 characters.",
    });
  }

  const isTurkish = language === "tr";

  // Local mock / no API key
  if (!process.env.OPENAI_API_KEY || process.env.MOCK_AI === "1") {
    const analysis = simpleJobAnalysisLocal(jobDescription, resumeText, language);
    return res.json({ ...analysis, source: "local-mock" });
  }

  try {
    const systemPrompt = isTurkish
      ? "Sen deneyimli bir İK uzmanı ve kariyer koçusun. Görevin, iş ilanlarını analiz ederek rolün seviyesini, temel gereksinimleri, teknik ve davranışsal yetkinlikleri çıkarmaktır. Eğer adayın CV metni verilmişse, ilanın adayla ne kadar uyumlu olduğunu da yorumlarsın."
      : "You are an experienced recruiter and career coach. Your job is to analyze job descriptions to extract role level, key requirements, technical and soft skills. If a candidate resume is provided, you also comment on alignment between the resume and the job.";

    const schema = {
      roleTitle: "string",
      jobSummary: "string",
      seniority:
        'string (one of: "junior", "mid", "senior", "lead", "manager", "director", "executive", "unspecified")',
      hardSkills: "string[]",
      softSkills: "string[]",
      tools: "string[]",
      keywords: "string[]",
      redFlags: "string[]",
      recommendedResumeTweaks: "string[]",
      matchSummary:
        "string (short paragraph about how well the resume matches the job; empty if no resumeText)",
    };

    const userPrompt = `
      Job description:
      ${jobDescription}

      Candidate resume (optional):
      ${resumeText || "(not provided)"}

      Return a JSON object ONLY (no backticks, no extra text) with the following shape:

      ${JSON.stringify(schema, null, 2)}

      Rules:
      - Keep values short and focused.
      - "roleTitle": the main role from the ad (e.g., "Senior Salesforce Developer").
      - "seniority": best guess based on the ad.
      - "hardSkills": concrete technical abilities, domain knowledge.
      - "softSkills": communication, leadership, teamwork, etc.
      - "tools": platforms, frameworks, tools, technologies.
      - "keywords": important phrases that should appear in a resume.
      - "redFlags": potential concerns (e.g., very vague responsibilities, unrealistic expectations).
      - "recommendedResumeTweaks": short action tips for improving the resume for this job.
      - "matchSummary": if resume is provided, summarize alignment in 2–4 sentences; otherwise empty string.
      `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 700,
    });

    let raw = completion.choices?.[0]?.message?.content?.trim() || "";

    // Try to parse JSON; if the model added extra text, slice between first { and last }
    const firstBrace = raw.indexOf("{");
    const lastBrace = raw.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      raw = raw.slice(firstBrace, lastBrace + 1);
    }

    let analysis;
    try {
      analysis = JSON.parse(raw);
    } catch (parseErr) {
      console.error("JSON parse error in /analyze-job:", parseErr);
      analysis = simpleJobAnalysisLocal(jobDescription, resumeText, language);
      return res.json({ ...analysis, source: "local-fallback-json" });
    }

    // Basic sanity: ensure required fields exist, otherwise fallback
    if (
      !analysis ||
      typeof analysis !== "object" ||
      !analysis.jobSummary ||
      !analysis.roleTitle
    ) {
      const fallback = simpleJobAnalysisLocal(jobDescription, resumeText, language);
      return res.json({ ...fallback, source: "local-fallback-shape" });
    }

    return res.json({ ...analysis, source: "openai" });
  } catch (err) {
    console.error("Error in /analyze-job:", err);

    if (err?.code === "insufficient_quota" || err?.status === 429) {
      const analysis = simpleJobAnalysisLocal(jobDescription, resumeText, language);
      return res.status(200).json({
        ...analysis,
        source: "local-fallback",
        warning: isTurkish
          ? "OpenAI kotası doldu, local mock kullanılıyor."
          : "OpenAI quota exceeded, using local fallback.",
      });
    }

    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;