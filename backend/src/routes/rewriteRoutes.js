// backend/src/routes/rewriteRoutes.js
const express = require("express");
const OpenAI = require("openai");
const { simpleBulletRewriteLocal } = require("../utils/fallbacks");
const router = express.Router();

// Only instantiate OpenAI when we actually have a key AND not in mock mode
let openai = null;
if (process.env.OPENAI_API_KEY && process.env.MOCK_AI !== "1") {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, });
}

// /bullet-rewrite
router.post("/bullet-rewrite", async (req, res) => {
  const { bulletText, targetRole = "", language = "en", tone = "impact" } = req.body || {};

  if (!bulletText || typeof bulletText !== "string") {
    return res.status(400).json({ error: "bulletText (string) is required" });
  }

  if (bulletText.length > 500) {
    return res.status(400).json({
      error: "Bullet text is too long. Maximum allowed is 500 characters.",
    });
  }

  if (targetRole && targetRole.length > 100) {
    return res.status(400).json({
      error: "Target role is too long. Maximum allowed is 100 characters.",
    });
  }

  // 🔒 Guardrails: abuse / out-of-scope check
  const guard = assessCareerInput({ bulletText: bulletText || "", targetRole: targetRole || "" });
  if (!guard.ok) {
    return res.status(400).json({
      error: guard.message,
      reason: guard.reason,
    });
  }

  const isTurkish = language === "tr";

  // If no OpenAI client → use local mock
  if (!openai) {
    const suggestions = simpleBulletRewriteLocal( bulletText, targetRole, language );
    return res.json({ originalBullet: bulletText, suggestions, source: "local-mock", });
  }

  try {
    const systemPrompt = isTurkish
      ? "Sen deneyimli bir kariyer ve CV koçusun. Görevin, kullanıcının verdiği maddeyi (bullet point) daha güçlü, ölçülebilir ve profesyonel hale getirmek. Türkçe yaz ve sadece CV maddeleri üret."
      : "You are an experienced career and resume coach. Your job is to rewrite resume bullet points to be stronger, more measurable, and professional. Respond only with bullet point suggestions.";

    const toneHint = (() => {
      if (tone === "leadership") {
        return isTurkish
          ? "Liderlik, sahiplenme ve ekip çalışmasını vurgula."
          : "Emphasize leadership, ownership, and collaboration.";
      }
      if (tone === "concise") {
        return isTurkish
          ? "Maddeleri kısa ve net tut."
          : "Keep the bullets short and concise.";
      }
      // impact (default)
      return isTurkish
        ? "Ölçülebilir etkiyi ve somut sonuçları vurgula."
        : "Emphasize measurable impact and concrete results.";
    })();

    const userPrompt = `
      Bullet text:
      ${bulletText}

      Target role (optional):
      ${targetRole || (isTurkish ? "Belirtilmedi" : "Not specified")}

      Instructions:
      - Rewrite this bullet into 3 improved versions.
      - Preserve the original meaning but make it stronger and more professional.
      - Use strong action verbs and, where reasonable, measurable outcomes.
      - ${toneHint}
      - Do NOT add explanations or extra text.
      - Output exactly 3 bullet points, each on its own line, starting with "- ".
      `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.4,
      max_tokens: 400,
    });

    const raw = completion.choices?.[0]?.message?.content?.trim() || "";
    let suggestions = raw
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line)
      .map((line) => line.replace(/^[-•\d.)\s]+/, "")) // strip bullets/numbers
      .filter((line) => line.length > 0)
      .slice(0, 3);

    if (!suggestions.length) {
      suggestions = simpleBulletRewriteLocal(bulletText, targetRole, language);
    }

    return res.json({
      originalBullet: bulletText,
      suggestions,
      source: "openai",
    });
  } catch (err) {
    console.error("Error in /bullet-rewrite:", err);

    if (err?.code === "insufficient_quota" || err?.status === 429) {
      const suggestions = simpleBulletRewriteLocal(
        bulletText,
        targetRole,
        language
      );
      return res.status(200).json({
        originalBullet: bulletText,
        suggestions,
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