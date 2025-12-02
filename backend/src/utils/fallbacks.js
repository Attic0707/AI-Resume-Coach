// backend/src/utils/fallbacks.js

function simpleLocalOptimize(resumeText, targetRole, language) {
  const isTurkish = language === "tr";

  const prefix = isTurkish
    ? "AI ile (local mock) optimize edilmiş özgeçmiş:\n\n"
    : "Locally mocked AI-optimized resume:\n\n";

  const summary = isTurkish
    ? `Hedef pozisyon: ${
        targetRole || "Belirtilmedi"
      }\n\nÖne çıkanlar:\n• Daha net başarı odaklı cümleler\n• Güçlü fiiller ve ölçülebilir sonuçlar\n• Pozisyonla uyumlu anahtar kelimeler\n\n`
    : `Target role: ${
        targetRole || "Not specified"
      }\n\nHighlights:\n• More achievement-focused phrasing\n• Strong action verbs & measurable impact\n• Keywords aligned with the role\n\n`;

  const improvedBody = isTurkish
    ? resumeText
        .replace(/experienced/gi, "deneyimli")
        .replace(/improved/gi, "iyileştirdi")
        .concat(
          "\n\n• Metrikleri somut rakamlarla güçlendirin (ör: %20 iyileşme).\n• Kullandığınız teknolojileri net şekilde listeleyin.\n• Son 5 yıla odaklanın, daha eski işleri kısaltın."
        )
    : resumeText
        .replace(/experienced/gi, "Highly experienced")
        .replace(/improved/gi, "significantly improved")
        .concat(
          "\n\n• Add concrete metrics (e.g., 25% faster response time).\n• Emphasize tools & platforms you used.\n• Focus on the last 5 years, shorten older roles."
        );

  return prefix + summary + improvedBody;
}

function simpleJobMatchLocal(resumeText, jobDescription, language) {
  const isTurkish = language === "tr";

  const header = isTurkish
    ? "İlana göre uyarlanmış CV (local mock):\n\n"
    : "Locally mocked tailored resume for this job:\n\n";

  const jdShort =
    jobDescription.length > 300
      ? jobDescription.slice(0, 300) + "..."
      : jobDescription;

  const bullets = isTurkish
    ? `İlan özeti:\n"${jdShort}"\n\nUyarlama notları:\n• İlan anahtar kelimeleri CV'ye entegre edilmelidir.\n• Sorumluluklar ilandaki beklentilerle hizalanmalıdır.\n• En güçlü proje örnekleri bu role göre öne çıkarılmalıdır.\n\n`
    : `Job description summary:\n"${jdShort}"\n\nTailoring notes:\n• Job description keywords should be woven into your experience.\n• Responsibilities should match the role expectations.\n• Strongest project examples for this role should be highlighted.\n\n`;

  return header + bullets + resumeText;
}

function simpleCoverLetterLocal(resumeText, jobDescription, language) {
  const isTurkish = language === "tr";

  const jdShort =
    jobDescription && jobDescription.length > 260
      ? jobDescription.slice(0, 260) + "..."
      : jobDescription ||
        (isTurkish ? "İlan metni paylaşılmadı." : "Job description not provided.");

  if (isTurkish) {
    return (
      "Sayın İK Yetkilisi,\n\n" +
      "İlanınızda yer alan pozisyon için başvurumu iletmek isterim. Aşağıda yer alan deneyimlerim ve yetkinliklerim, bu rol için güçlü bir aday olduğumu düşündürmektedir.\n\n" +
      `İlanınızda özellikle aşağıdaki noktalar dikkatimi çekti:\n"${jdShort}"\n\n` +
      "CV'mde de görülebileceği üzere, benzer projelerde uçtan uca sorumluluklar aldım, ölçülebilir sonuçlar ürettim ve ekiplerle uyum içinde çalıştım.\n\n" +
      "Pozisyona sağlayabileceğim katkıları daha detaylı paylaşmak için bir görüşme fırsatı bulmaktan memnuniyet duyarım.\n\n" +
      "Saygılarımla,"
    );
  }

  return (
    "Dear Hiring Manager,\n\n" +
    "I am writing to express my interest in the position you advertised. My background and experience make me a strong fit for this role.\n\n" +
    `In your job description, the following points stood out to me:\n\"${jdShort}\"\n\n` +
    "As highlighted in my resume, I have taken ownership of similar projects end-to-end, delivered measurable outcomes, and collaborated effectively with cross-functional teams.\n\n" +
    "I would welcome the opportunity to discuss in more detail how I can contribute to your team.\n\n" +
    "Best regards,"
  );
}

function simpleInterviewFeedbackLocal(question, answer, language) {
  const isTurkish = language === "tr";

  const header = isTurkish
    ? "Görüşme Cevabı Değerlendirmesi (local mock):\n\n"
    : "Interview Answer Evaluation (local mock):\n\n";

  const qText =
    question && question.trim()
      ? question
      : isTurkish
      ? "Soru belirtilmedi."
      : "Question not provided.";

  const baseScore = answer && answer.length > 40 ? 7 : 4; // super rough
  const score = Math.min(10, baseScore + 1);

  const bodyTr = `
    Soru: ${qText}

    Güçlü Yönler:
    • Cevap genel olarak anlaşılır.
    • Soruya doğrudan yanıt verme niyeti var.
    • Kendi deneyimlerinden örnek vermeye çalışıyorsun.

    Geliştirme Noktaları:
    • STAR yapısını (Situation, Task, Action, Result) daha net kullan.
    • Ölçülebilir sonuçlar ekle (ör: %X artış, Y gün daha hızlı, Z TL tasarruf).
    • Rol ile bağlantıyı daha açık kur (şirketin/birimin hedeflerine nasıl katkı sağlıyorsun?).

    Öneri:
    • Önce durumu ve görevi 1-2 cümle ile anlat.
    • Sonra hangi aksiyonları aldığını net maddelerle söyle.
    • En sonda sonucu sayılarla ve etkisiyle özetle.

    Tahmini Skor (1–10): ${score}
    `;

  const bodyEn = `
    Question: ${qText}

    Strengths:
    • Answer is generally understandable.
    • You are attempting to address the question directly.
    • You reference your own experience.

    Areas to Improve:
    • Use the STAR structure (Situation, Task, Action, Result) more clearly.
    • Add measurable outcomes (e.g., %X increase, Y days faster, Z cost savings).
    • Tie your answer explicitly to the role and company goals.

    Suggestion:
    • Briefly state the situation and task in 1–2 sentences.
    • Then describe the specific actions you took.
    • Finish with the result, using numbers where possible.

    Estimated Score (1–10): ${score}
    `;

  return header + (isTurkish ? bodyTr : bodyEn);
}

function simpleInterviewQuestionsLocal(role, level, mode, language) {
  const isTurkish = language === "tr";
  const roleLabel = role || (isTurkish ? "bu rol" : "this role");

  const baseEn = [
    `Why are you interested in ${roleLabel}?`,
    `What makes you a strong fit for ${roleLabel}?`,
    `Tell me about a challenging project and how you handled it.`,
    `Describe a time you received critical feedback. How did you respond?`,
    `Tell me about a time you worked with a difficult stakeholder or colleague.`,
    `Describe a situation where you had to learn something quickly to succeed.`,
    `Tell me about a mistake you made and what you learned from it.`,
    `How do you prioritize tasks when everything seems urgent?`,
    `Give an example of a time you led a project or initiative.`,
    `Why should we choose you for ${roleLabel}?`,
  ];

  const baseTr = [
    `${roleLabel} için neden başvuruyorsun?`,
    `${roleLabel} pozisyonu için seni güçlü kılan özellikler neler?`,
    "Zorlayıcı bir projeni ve bununla nasıl başa çıktığını anlatır mısın?",
    "Eleştirel bir geri bildirim aldığın bir zamanı ve buna nasıl tepki verdiğini anlat.",
    "Zor bir paydaş veya çalışma arkadaşıyla çalıştığın bir durumu anlatır mısın?",
    "Başarılı olmak için çok hızlı öğrenmen gereken bir durumu anlat.",
    "Yaptığın bir hatayı ve bundan ne öğrendiğini paylaşır mısın?",
    "Her şey acil göründüğünde işleri nasıl önceliklendiriyorsun?",
    "Bir projeye veya inisiyatife liderlik ettiğin bir örneği anlat.",
    `${roleLabel} için neden seni seçmeliyiz?`,
  ];

  let all = isTurkish ? baseTr : baseEn;

  if (level === "junior") {
    all = all.map((q, idx) =>
      idx === 1
        ? q +
          (isTurkish
            ? " (Yeni mezun / kariyerinin başında biri olarak yanıtlayabilirsin.)"
            : " (You can answer from a junior / early-career perspective.)")
        : q
    );
  } else if (level === "senior") {
    all = all.map((q, idx) =>
      idx === 1
        ? q +
          (isTurkish
            ? " (Liderlik, mentörlük ve stratejik katkılara vurgu yap.)"
            : " (Emphasize leadership, mentoring and strategic impact.)")
        : q
    );
  }

  const desiredCount = mode === "deep" ? 10 : 5;
  return all.slice(0, desiredCount);
}

function simpleBulletRewriteLocal(bulletText, targetRole, language = "en") {
  const isTurkish = language === "tr";
  const base = bulletText || "";

  const prefix = isTurkish
    ? "• Geliştirilmiş: "
    : "• Improved: ";

  return [
    `${prefix}${base}`,
    `${prefix}${base} (v2)`,
    `${prefix}${base} (v3)`,
  ];
}

module.exports = {
  simpleLocalOptimize,
  simpleJobMatchLocal,
  simpleCoverLetterLocal,
  simpleInterviewFeedbackLocal,
  simpleInterviewQuestionsLocal,
  simpleBulletRewriteLocal,
};