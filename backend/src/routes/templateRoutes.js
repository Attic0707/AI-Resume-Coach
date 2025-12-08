// backend/src/routes/templateRoutes.js
const express = require("express");
const OpenAI = require("openai");
const { assessCareerInput } = require("../utils/guardrails");
const { simpleImprovedAboutMeLocal } = require("../utils/fallbacks");
const router = express.Router();

// Only instantiate OpenAI when we actually have a key AND not in mock mode
let openai = null;
if (process.env.OPENAI_API_KEY && process.env.MOCK_AI !== "1") {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// /about-me
router.post("/about-me", async (req, res) => {
  const { rawText, sectionType = "summary", language = "en" } = req.body || {}; // "summary" | "about" | "experience" | etc.

  if (!rawText || typeof rawText !== "string") {
    return res.status(400).json({ error: "rawText (string) is required" });
  }

  if (rawText.length > 8000) {
    return res.status(400).json({
      error: "rawText text is too long. Maximum allowed is 8,000 characters.",
    });
  }

  // 🔒 Guardrails
  const guard = assessCareerInput({ rawText: rawText || "" });
  if (!guard.ok) {
    return res.status(400).json({
      error: guard.message,
      reason: guard.reason,
    });
  }

  const isTurkish = language === "tr";

  // No OpenAI → local fallback
  if (!openai) {
    const optimized = simpleImprovedAboutMeLocal(rawText, language);
    return res.json({
      optimizedText: optimized,
      source: "local-mock",
    });
  }

  try {
    const systemPrompt = isTurkish
      ? "Sen özgeçmiş (CV) ve kariyer metinleri konusunda uzman bir kariyer koçusun. Kullanıcı sana; CV özeti, “Hakkımda” metni, iş deneyimi girdisi veya benzer bir bölüm metni gönderecek. Görevin, bu metni daha güçlü, ölçülebilir, işe alımcı dostu ve hedef role uygun hale getirmek. Yeni şirketler, pozisyonlar, tarihler veya açıkça ima edilmeyen başarılar UYDURMA. Kullanıcının gerçek geçmişine ve tonuna sadık kal. Çıktıyı akıcı, profesyonel ve yayınlanmaya hazır bir metin olarak TÜRKÇE yaz."
      : "You are an expert resume and career-branding writer. The user will send you text that may be a resume summary, an About Me section, a work experience entry, or a similar career-related section. Your goal is to rewrite it to be stronger, more measurable, recruiter-friendly, and aligned with target roles. Do NOT invent new employers, roles, dates, or clearly unrealistic achievements. Stay truthful to the user’s background and keep a natural, human tone. Your output must be polished and ready to paste into a resume or profile.";

    const sectionLabel =
      sectionType === "experience"
        ? isTurkish
          ? "İş deneyimi bölümü"
          : "Experience section"
        : isTurkish
        ? "Hakkımda / Özet bölümü"
        : "About / Summary section";

    const userPrompt = `
        Section label: ${sectionLabel}
        Original text:
        ${rawText}

        Rewrite this as a high-quality resume / career section.

        Instructions:
        - Keep everything truthful. Do NOT invent new employers, roles, dates, degrees or clearly exaggerated achievements.
        - Strengthen the first 1–2 sentences so they clearly position the candidate (who they are, what they do, what value they bring).
        - Focus on impact and outcomes, not just duties:
        - use strong action verbs
        - add measurable results and concrete examples when reasonably inferable
        - Keep the existing perspective consistent (first-person or third-person) and use a confident, professional tone.
        - Make it easy for recruiters and ATS to scan:
        - short paragraphs (1–3 sentences) and/or
        - bullet-style lines for achievements.
        - Improve clarity, flow and structure. Remove repetition, vague language and filler buzzwords.
        - Naturally weave in relevant skills, technologies and domain keywords when they fit the context; avoid keyword stuffing.
        - Do not add headings, labels, or meta commentary.
        - Output ONLY the improved section text, ready to paste into a resume or profile, with no extra explanation or quotes.
        `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.5,
      max_tokens: 800,
    });

    const optimizedText =
      completion.choices?.[0]?.message?.content?.trim() ||
      simpleImprovedAboutMeLocal(rawText, language);

    return res.json({
      optimizedText,
      source: "openai",
    });
  } catch (err) {
    console.error("Error in /about-me:", err);

    if (err?.code === "insufficient_quota" || err?.status === 429) {
      const optimized = simpleImprovedAboutMeLocal(rawText, language);
      return res.status(200).json({
        optimizedText: optimized,
        source: "local-fallback",
        warning: isTurkish
          ? "OpenAI kotası doldu, local mock kullanılıyor."
          : "OpenAI quota exceeded, using local fallback.",
      });
    }

    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * /skills
 * - Treats rawText as a Skills section.
 * - Cleans, groups, deduplicates, and prioritizes professionally relevant skills.
 */
router.post("/skills", async (req, res) => {
  const { rawText, language = "en" } = req.body || {};

  if (!rawText || typeof rawText !== "string") {
    return res.status(400).json({ error: "rawText (string) is required" });
  }

  if (rawText.length > 8000) {
    return res.status(400).json({
      error: "rawText text is too long. Maximum allowed is 8,000 characters.",
    });
  }

  const guard = assessCareerInput({ rawText: rawText || "" });
  if (!guard.ok) {
    return res.status(400).json({
      error: guard.message,
      reason: guard.reason,
    });
  }

  const isTurkish = language === "tr";

  if (!openai) {
    const optimized = simpleImprovedSkillsLocal(rawText, language);
    return res.json({ optimizedText: optimized, source: "local-mock" });
  }

  try {
    const systemPrompt = isTurkish
      ? "Sen CV ve LinkedIn Skills bölümleri konusunda uzman bir kariyer koçusun. Görevin, kullanıcının beceri listesini profesyonel, odaklı ve başvurulan pozisyonla uyumlu hale getirmek. Teknik becerileri, araçları ve iş dünyasında değer gören yetkinlikleri öne çıkar; hobi veya alakasız öğeleri geri plana al. Gerçeğe aykırı, uydurma beceriler ekleme."
      : "You are an expert career coach specializing in Skills sections for resumes and LinkedIn. Your job is to transform the user's skill list into a professional, focused, and role-relevant skills section. Emphasize technical skills, tools, and in-demand competencies; de-emphasize hobbies or irrelevant items. Do not add skills that clearly aren't implied by the text.";

    const userPrompt = `
        Original skills text:
        ${rawText}

        Rewrite this as a strong, concise Skills section.

        Instructions:
        - Keep everything truthful; do NOT invent new skills or tools that are clearly not implied.
        - Clean the formatting:
        - remove duplicates and overlapping items (e.g., "MS Excel" and "Microsoft Excel" → one entry)
        - use consistent casing (e.g., "React", "Salesforce", "Python").
        - Prioritize professionally relevant skills:
        - core technical skills
        - domain knowledge
        - key tools / platforms / frameworks
        - business or analytical skills valued by employers.
        - If there are obvious hobbies or non-professional items, either remove them or place them at the end if they support the professional story.
        - You may group skills logically if it helps readability (e.g., “Technical”, “Tools”, “Languages”), but keep it compact and ATS-friendly.
        - Output ONLY the improved Skills section as text, ready to paste into a resume or profile.
        `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.5,
      max_tokens: 600,
    });

    const optimizedText =
      completion.choices?.[0]?.message?.content?.trim() ||
      simpleImprovedSkillsLocal(rawText, language);

    return res.json({ optimizedText, source: "openai" });
  } catch (err) {
    console.error("Error in /skills:", err);

    if (err?.code === "insufficient_quota" || err?.status === 429) {
      const optimized = simpleImprovedSkillsLocal(rawText, language);
      return res.status(200).json({
        optimizedText: optimized,
        source: "local-fallback",
        warning: isTurkish
          ? "OpenAI kotası doldu, local mock kullanılıyor."
          : "OpenAI quota exceeded, using local fallback.",
      });
    }

    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * /projects
 * - Treats rawText as a list of key projects / portfolio items.
 * - Emphasizes outcome, role, tech stack, and relevance to the roles the user is likely targeting.
 */
router.post("/projects", async (req, res) => {
  const { rawText, language = "en" } = req.body || {};

  if (!rawText || typeof rawText !== "string") {
    return res.status(400).json({ error: "rawText (string) is required" });
  }

  if (rawText.length > 8000) {
    return res.status(400).json({
      error: "rawText text is too long. Maximum allowed is 8,000 characters.",
    });
  }

  const guard = assessCareerInput({ rawText: rawText || "" });
  if (!guard.ok) {
    return res.status(400).json({
      error: guard.message,
      reason: guard.reason,
    });
  }

  const isTurkish = language === "tr";

  if (!openai) {
    const optimized = simpleImprovedProjectsLocal(rawText, language);
    return res.json({ optimizedText: optimized, source: "local-mock" });
  }

  try {
    const systemPrompt = isTurkish
      ? "Sen proje ve portföy açıklamaları konusunda uzman bir kariyer koçusun. Kullanıcının projelerini; rolü, kullanılan teknolojiler ve elde edilen iş sonuçlarıyla birlikte, işe alımcı ve işe alım yöneticileri için etkileyici hale getirirsin. Yeni projeler, teknolojiler veya başarılar UYDURMA."
      : "You are an expert career coach for project and portfolio descriptions. Your job is to present the user's projects in a way that clearly shows their role, the tech stack, and the impact of the work for recruiters and hiring managers. Do NOT invent new projects, technologies, or achievements.";

    const userPrompt = `
        Original projects text (may contain one or multiple projects):
        ${rawText}

        Rewrite this as a strong Projects / Portfolio section.

        Instructions:
        - Treat this as content that will appear under a “Projects” section in a resume or portfolio.
        - Keep everything truthful; do NOT invent new projects, companies, technologies, or unrealistic results.
        - For each project, where possible, surface:
        - project name or short label
        - the user's role
        - key technologies / tools used
        - the business or user problem being solved
        - concrete outcomes or impact (numbers, improvements) when reasonably inferable.
        - Use a clean, recruiter-friendly format:
        - short project headings and
        - 1–3 bullet-style lines or short sentences per project.
        - Emphasize projects that are most relevant to modern, in-demand roles based on the text (e.g., recent, technical, or complex work).
        - Remove obvious fluff, vague descriptions, or very minor side notes unless they support the main story.
        - Output ONLY the improved Projects section text, ready to paste into a resume or profile.
        `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.5,
      max_tokens: 800,
    });

    const optimizedText =
      completion.choices?.[0]?.message?.content?.trim() ||
      simpleImprovedProjectsLocal(rawText, language);

    return res.json({ optimizedText, source: "openai" });
  } catch (err) {
    console.error("Error in /projects:", err);

    if (err?.code === "insufficient_quota" || err?.status === 429) {
      const optimized = simpleImprovedProjectsLocal(rawText, language);
      return res.status(200).json({
        optimizedText: optimized,
        source: "local-fallback",
        warning: isTurkish
          ? "OpenAI kotası doldu, local mock kullanılıyor."
          : "OpenAI quota exceeded, using local fallback.",
      });
    }

    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * /expertise
 * - Treats rawText as “Areas of Expertise”.
 * - Turns it into a sharp, domain-focused list aligned with likely target roles.
 */
router.post("/expertise", async (req, res) => {
  const { rawText, language = "en" } = req.body || {};

  if (!rawText || typeof rawText !== "string") {
    return res.status(400).json({ error: "rawText (string) is required" });
  }

  if (rawText.length > 8000) {
    return res.status(400).json({
      error: "rawText text is too long. Maximum allowed is 8,000 characters.",
    });
  }

  const guard = assessCareerInput({ rawText: rawText || "" });
  if (!guard.ok) {
    return res.status(400).json({
      error: guard.message,
      reason: guard.reason,
    });
  }

  const isTurkish = language === "tr";

  if (!openai) {
    const optimized = simpleImprovedExpertiseLocal(rawText, language);
    return res.json({ optimizedText: optimized, source: "local-mock" });
  }

  try {
    const systemPrompt = isTurkish
      ? "Sen CV'lerdeki 'Uzmanlık Alanları' (Areas of Expertise) bölümü konusunda uzman bir kariyer koçusun. Görevin, kullanıcının güçlü olduğu alanları; net, profesyonel ve başvurulan rol/rollerle uyumlu şekilde sunmaktır. Gerçeğe aykırı uzmanlık alanları ekleme."
      : "You are an expert career coach for the “Areas of Expertise” section on resumes. Your job is to present the user's strongest domains of expertise in a clear, professional way that aligns with the types of roles they are likely targeting. Do NOT add fictitious areas of expertise.";

    const userPrompt = `
        Original expertise text:
        ${rawText}

        Rewrite this as a sharp “Areas of Expertise” section.

        Instructions:
        - Keep everything truthful; do NOT add new domains or specialties that are not implied.
        - Distill the content into 6–14 concise expertise phrases that clearly communicate what the candidate is good at.
        - Focus on domains and capabilities that employers care about (e.g., “Enterprise Salesforce Architecture”, “End-to-end Mobile App Delivery”, “B2B SaaS Sales Strategy”).
        - Avoid generic buzzwords alone (“hardworking”, “dynamic”, etc.) unless they are attached to something concrete.
        - You may format as a comma-separated list, short rows, or bullet-style items – but keep it compact and ATS-friendly.
        - Where there is overlap, merge similar items into a stronger phrase.
        - Output ONLY the improved Areas of Expertise section text, ready to paste into a resume or profile.
        `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.5,
      max_tokens: 500,
    });

    const optimizedText =
      completion.choices?.[0]?.message?.content?.trim() ||
      simpleImprovedExpertiseLocal(rawText, language);

    return res.json({ optimizedText, source: "openai" });
  } catch (err) {
    console.error("Error in /expertise:", err);

    if (err?.code === "insufficient_quota" || err?.status === 429) {
      const optimized = simpleImprovedExpertiseLocal(rawText, language);
      return res.status(200).json({
        optimizedText: optimized,
        source: "local-fallback",
        warning: isTurkish
          ? "OpenAI kotası doldu, local mock kullanılıyor."
          : "OpenAI quota exceeded, using local fallback.",
      });
    }

    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * /publishes
 * - Treats rawText as “Publications & Awards / Rewards”.
 * - Highlights credible publications, talks, and career-relevant awards.
 */
router.post("/publishes", async (req, res) => {
  const { rawText, language = "en" } = req.body || {};

  if (!rawText || typeof rawText !== "string") {
    return res.status(400).json({ error: "rawText (string) is required" });
  }

  if (rawText.length > 8000) {
    return res.status(400).json({
      error: "rawText text is too long. Maximum allowed is 8,000 characters.",
    });
  }

  const guard = assessCareerInput({ rawText: rawText || "" });
  if (!guard.ok) {
    return res.status(400).json({
      error: guard.message,
      reason: guard.reason,
    });
  }

  const isTurkish = language === "tr";

  if (!openai) {
    const optimized = simpleImprovedPublishesLocal(rawText, language);
    return res.json({ optimizedText: optimized, source: "local-mock" });
  }

  try {
    const systemPrompt = isTurkish
      ? "Sen yayınlar ve kariyer ödülleri konusunda uzman bir kariyer koçusun. Kullanıcının yayımlanmış çalışmaları, konuşmaları ve kariyerle ilgili ödüllerini; işe alımcılar için güçlü ve güvenilir bir şekilde sunarsın. Yeni makaleler, konferanslar veya ödüller UYDURMA."
      : "You are an expert career coach for Publications and Awards sections. Your job is to present the user's published work, talks, and career-relevant awards in a strong, credible way for recruiters and hiring managers. Do NOT invent new papers, conferences, or awards.";

    const userPrompt = `
        Original publications / rewards text:
        ${rawText}

        Rewrite this as a strong “Publications & Awards” (or similar) section.

        Instructions:
        - Keep everything truthful; do NOT invent new publications, conferences, journals, or awards.
        - For each publication or piece of work, where possible, surface:
        - title
        - venue (journal, conference, platform) or context
        - year (if mentioned or clearly implied).
        - For awards or recognitions, surface:
        - award name
        - granting organization
        - brief context and year if available.
        - Use a clean format:
        - bullet-style lines or short entries, each starting with the title or award name.
        - Emphasize items that are clearly related to the candidate's professional field and target roles.
        - Remove clutter, vague lines, or minor items that don't add professional value if there is a lot of content.
        - Output ONLY the improved Publications & Awards section text, ready to paste into a resume or profile.
        `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.5,
      max_tokens: 800,
    });

    const optimizedText =
      completion.choices?.[0]?.message?.content?.trim() ||
      simpleImprovedPublishesLocal(rawText, language);

    return res.json({ optimizedText, source: "openai" });
  } catch (err) {
    console.error("Error in /publishes:", err);

    if (err?.code === "insufficient_quota" || err?.status === 429) {
      const optimized = simpleImprovedPublishesLocal(rawText, language);
      return res.status(200).json({
        optimizedText: optimized,
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
