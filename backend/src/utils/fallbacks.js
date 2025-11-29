// ---------- Local fallback helpers ---------- //

function simpleLocalOptimize(resumeText, targetRole, language) {
  const isTurkish = language === "tr";

  const prefix = isTurkish
    ? "AI ile (local mock) optimize edilmiş özgeçmiş:\n\n"
    : "Locally mocked AI-optimized resume:\n\n";

  const summary = isTurkish
    ? `Hedef pozisyon: ${targetRole || "Belirtilmedi"}\n\nÖne çıkanlar:\n• Daha net başarı odaklı cümleler\n• Güçlü fiiller ve ölçülebilir sonuçlar\n• Pozisyonla uyumlu anahtar kelimeler\n\n`
    : `Target role: ${targetRole || "Not specified"}\n\nHighlights:\n• More achievement-focused phrasing\n• Strong action verbs & measurable impact\n• Keywords aligned with the role\n\n`;

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
      : jobDescription || (isTurkish ? "İlan metni paylaşılmadı." : "Job description not provided.");

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

  const qText = question && question.trim()
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
  const base = isTurkish
    ? [`Bu pozisyona neden başvuruyorsun?`, `Bu rol için seni diğer adaylardan ayıran şey nedir?`]
    : [`Why are you applying for this role?`, `What makes you different from other candidates for this role?`];

  // You can create different sets by mode/level later; for now just return ~5
  const extra = isTurkish
    ? [
        `${role || "Bu rol"} için en zor projen neydi?`,
        "Hata yaptığın bir durumu ve bunu nasıl düzelttiğini anlatır mısın?",
        "Bir ekiple yaşadığın anlaşmazlığı ve bunu nasıl çözdüğünü anlat.",
      ]
    : [
        `What was the most challenging project related to ${role || "this role"} you worked on?`,
        "Tell me about a mistake you made and how you fixed it.",
        "Describe a conflict with a teammate and how you resolved it.",
      ];

  return [...base, ...extra];
}

module.exports = {
  simpleLocalOptimize,
  simpleJobMatchLocal,
  simpleCoverLetterLocal,
  simpleInterviewFeedbackLocal,
  simpleInterviewQuestionsLocal,
};