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

function simpleJobAnalysisLocal(jobDescription, resumeText = "", language = "en") {
  const isTurkish = language === "tr";
  const jd = jobDescription || "";
  const jdShort = jd.length > 400 ? jd.slice(0, 400) + "..." : jd;

  const firstLine = jd.split("\n")[0] || "";
  const roleTitleGuess =
    firstLine.length > 0 && firstLine.length < 80
      ? firstLine.trim()
      : isTurkish
      ? "Rol başlığı (tahmini)"
      : "Role title (approximate)";

  return {
    roleTitle: roleTitleGuess,
    jobSummary: isTurkish ? `İlan özeti (local mock): ${jdShort}` : `Job summary (local mock): ${jdShort}`,
    seniority: "unspecified",
    hardSkills: [],
    softSkills: [],
    tools: [],
    keywords: [],
    redFlags: [],
    recommendedResumeTweaks: isTurkish
      ? [
          "CV'nde ilandaki anahtar kelimeleri net olarak belirt.",
          "Deneyimlerini ilandaki sorumluluklarla eşleştir.",
          "Ölçülebilir sonuçlar ekle (ör: %20 artış, 3x hızlanma).",
        ]
      : [
          "Make sure your resume uses the key phrases from this job ad.",
          "Align your responsibilities with those listed in the posting.",
          "Add measurable results (e.g., 20% increase, 3x faster, etc.).",
        ],
    matchSummary: resumeText
      ? isTurkish
        ? "CV ile temel uyum kontrol edildi (local mock). Detaylı analiz için tam AI modeli gerekir."
        : "Basic alignment between resume and job checked (local mock). Detailed matching requires the full AI model."
      : "",
  };
}

function simpleLinkedInOptimizeLocal(linkedInText, sectionType = "about", targetRole = "", language = "en") {
  const isTurkish = language === "tr";
  const base = linkedInText || "";

  const header = isTurkish
    ? "LinkedIn bölümü (local mock ile hafifçe iyileştirilmiş):\n\n"
    : "LinkedIn section (lightly improved via local mock):\n\n";

  const hintLines = [];

  if (sectionType === "about") {
    hintLines.push(
      isTurkish
        ? "• Açılış cümleni daha net ve güçlü yap (kim olduğunu 1–2 cümlede özetle)."
        : "• Make your opening line clearer and stronger (who you are in 1–2 sentences)."
    );
    hintLines.push(
      isTurkish
        ? "• Somut sonuçlar ve metrikler ekle (ör: %X artış, Y ülke, Z proje)."
        : "• Add concrete results and metrics (e.g., %X increase, Y markets, Z projects)."
    );
  } else {
    hintLines.push(
      isTurkish
        ? "• Görev listesinden çok, başarı odaklı cümleler kullan."
        : "• Focus less on duties and more on achievements."
    );
    hintLines.push(
      isTurkish
        ? "• Her maddeyi güçlü bir fiille başlat."
        : "• Start each bullet with a strong action verb."
    );
  }

  if (targetRole) {
    hintLines.push(
      isTurkish
        ? `• Metni "${targetRole}" rolüne daha fazla hizalayacak anahtar kelimeler ekle.`
        : `• Weave in keywords that support the "${targetRole}" target role.`
    );
  }

  const hints = hintLines.length
    ? (isTurkish ? "\n\nNotlar:\n" : "\n\nNotes:\n") +
      hintLines.map((l) => "• " + l).join("\n")
    : "";

  // Very naive text tweak
  const improved = base
    .replace(/\bexperienced\b/gi, isTurkish ? "deneyimli" : "experienced professional")
    .replace(/\bresponsible for\b/gi, isTurkish ? "sorumluluk aldım" : "led")
    .concat(
      isTurkish
        ? "\n\n• Mümkün olduğunda sayılar ve sonuçlar ekleyerek cümlelerini güçlendir."
        : "\n\n• Whenever possible, strengthen sentences by adding numbers and concrete outcomes."
    );

  return header + improved + hints;
}

function simpleImprovedAboutMeLocal(aboutmeText, language) {
  const isTurkish = language === "tr";
  const base = (aboutmeText || "").trim();

  const header = isTurkish
    ? "Özgeçmiş / kariyer bölümü (local mock ile hafifçe iyileştirilmiş):\n\n"
    : "Resume / career section (lightly improved via local mock):\n\n";

  if (!base) {
    return (
      header +
      (isTurkish
        ? "Metin boş görünüyor. Lütfen özgeçmişinden bir paragraf veya deneyim bölümü ekle."
        : "The text seems empty. Please provide a paragraph or experience section from your resume.")
    );
  }

  const hintLines = [
    isTurkish
      ? "• Açılış cümleni daha net yap: kim olduğunu ve ne kattığını 1–2 cümlede özetle."
      : "• Make your opening sentence clearer: who you are and what you bring in 1–2 lines.",
    isTurkish
      ? "• Sadece görev değil, sonuç ve etkiyi vurgula (örn. %X artış, Y proje, Z müşteri)."
      : "• Emphasize results and impact, not just duties (e.g., %X increase, Y projects, Z clients).",
    isTurkish
      ? "• Cümlelerini sade, profesyonel ve kolay okunur tut (kısa paragraflar, güçlü fiiller)."
      : "• Keep sentences clear, professional, and easy to scan (short paragraphs, strong verbs).",
  ];

  const hints =
    (isTurkish ? "\n\nNotlar:\n" : "\n\nNotes:\n") +
    hintLines.map((l) => l).join("\n");

  // Very naive text tweaks just to avoid completely raw echo
  let improved = base;

  if (!isTurkish) {
    improved = improved
      .replace(/\bhard[- ]working\b/gi, "results-driven")
      .replace(/\bteam player\b/gi, "collaborative professional")
      .replace(/\bresponsible for\b/gi, "led")
      .replace(/\btasked with\b/gi, "entrusted with");
  } else {
    improved = improved
      .replace(/\büzerine çalıştım\b/gi, "sorumluluk aldım")
      .replace(/\becellendim\b/gi, "uzmanlaştım")
      .replace(/\bsıkı çalışan\b/gi, "sonuç odaklı");
  }

  // Add one generic coaching nudge at the end
  improved += isTurkish
    ? "\n\n• Mümkün olduğunda sayılar, ölçülebilir sonuçlar ve özel örnekler ekleyerek bölümü güçlendir."
    : "\n\n• Whenever possible, add numbers, measurable results, and concrete examples to strengthen this section.";

  return header + improved + hints;
}

/**
 * Local mock for Skills section
 */
function simpleImprovedSkillsLocal(skillsText, language) {
  const isTurkish = language === "tr";
  const base = (skillsText || "").trim();

  const header = isTurkish
    ? "Yetenekler bölümü (local mock ile hafifçe düzenlendi):\n\n"
    : "Skills section (lightly improved via local mock):\n\n";

  if (!base) {
    return (
      header +
      (isTurkish
        ? "Metin boş görünüyor. Lütfen teknik ve iş becerilerini virgülle veya satır satır ekle."
        : "The text seems empty. Please provide your technical and business skills as comma-separated or line-separated text.")
    );
  }

  // Split into items (commas / newlines / bullets), trim & dedupe
  const rawItems = base
    .split(/[\n,;•]+/g)
    .map((s) => s.trim())
    .filter(Boolean);

  const seen = new Set();
  const items = [];
  for (const it of rawItems) {
    const key = it.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      items.push(it);
    }
  }

  // Light normalization (capitalize first letter, keep acronyms)
  const normalized = items.map((item) => {
    if (!item) return item;
    if (item.toUpperCase() === item) return item; // ACRONYM like SQL, REST
    return item.charAt(0).toUpperCase() + item.slice(1);
  });

  const body = isTurkish
    ? "• " + normalized.join("\n• ")
    : "• " + normalized.join("\n• ");

  const hints =
    (isTurkish ? "\n\nNotlar:\n" : "\n\nNotes:\n") +
    (isTurkish
      ? "• En güçlü ve başvurduğun role en uygun becerileri en üste yaz.\n" +
        "• Aynı anlama gelen tekrarları sadeleştir (örn. 'MS Excel' ve 'Excel' → tek satır).\n" +
        "• Teknik beceriler, araçlar ve iş becerileri arasında doğal bir denge kur."
      : "• Put your strongest, most role-relevant skills at the top.\n" +
        "• Merge duplicates that mean the same thing (e.g., 'MS Excel' and 'Excel' → one entry).\n" +
        "• Balance technical skills, tools, and business/soft skills.");

  return header + body + hints;
}

/**
 * Local mock for Projects section
 * Pretends we took raw project blurbs and turned them into bullet-style, impact-focused lines.
 */
function simpleImprovedProjectsLocal(projectsText, language) {
  const isTurkish = language === "tr";
  const base = (projectsText || "").trim();

  const header = isTurkish
    ? "Projeler bölümü (local mock ile hafifçe yapılandırıldı):\n\n"
    : "Projects section (lightly structured via local mock):\n\n";

  if (!base) {
    return (
      header +
      (isTurkish
        ? "Metin boş görünüyor. Lütfen üzerinde çalıştığın 1–3 önemli projeyi, her biri için 1–2 cümle olacak şekilde ekle."
        : "The text seems empty. Please provide 1–3 key projects with 1–2 sentences for each.")
    );
  }

  // Rough split by blank lines or new lines; treat each non-empty chunk as one project
  const lines = base
    .split(/\n+/g)
    .map((l) => l.trim())
    .filter(Boolean);

  // Convert each line into a bullet-like project highlight
  const improvedLines = lines.map((line) => {
    // Add a tiny nudge of “impact language” without changing content
    let tweaked = line;
    if (!isTurkish) {
      tweaked = tweaked.replace(/\bworked on\b/gi, "delivered");
      tweaked = tweaked.replace(/\bhelped\b/gi, "contributed to");
    } else {
      tweaked = tweaked.replace(/\büzerinde çalıştım\b/gi, "teslim ettim");
      tweaked = tweaked.replace(/\byardımcı oldum\b/gi, "katkı sağladım");
    }

    if (/^[•\-]/.test(tweaked)) {
      return tweaked; // already looks like a bullet
    }
    return "• " + tweaked;
  });

  const body = improvedLines.join("\n");

  const hints =
    (isTurkish ? "\n\nNotlar:\n" : "\n\nNotes:\n") +
    (isTurkish
      ? "• Her proje için rolünü (örn. tek geliştirici, lead, ekip üyesi) netleştirmeye çalış.\n" +
        "• Kullanılan önemli teknolojileri ve elde edilen iş sonuçlarını (kullanıcı sayısı, performans artışı vb.) ekle.\n" +
        "• En güncel ve hedef role en yakın projeleri en üste taşı."
      : "• For each project, try to clarify your role (e.g., sole developer, lead, team member).\n" +
        "• Add key technologies and outcomes where you can (user adoption, performance improvements, revenue impact).\n" +
        "• Put the most recent and most role-relevant projects at the top.");

  return header + body + hints;
}

/**
 * Local mock for Expertise section
 * Turns a messy list into a tight “Areas of Expertise” style list.
 */
function simpleImprovedExpertiseLocal(expertiseText, language) {
  const isTurkish = language === "tr";
  const base = (expertiseText || "").trim();

  const header = isTurkish
    ? "Uzmanlık alanları bölümü (local mock ile hafifçe düzenlendi):\n\n"
    : "Areas of Expertise section (lightly refined via local mock):\n\n";

  if (!base) {
    return (
      header +
      (isTurkish
        ? "Metin boş görünüyor. Lütfen kendini güçlü hissettiğin uzmanlık alanlarını ekle (örn. 'Kurumsal Salesforce Mimarlığı', 'Mobil Uygulama Geliştirme')."
        : "The text seems empty. Please add the domains where you feel most confident (e.g., 'Enterprise Salesforce Architecture', 'Mobile App Development').")
    );
  }

  const rawItems = base
    .split(/[\n,;•]+/g)
    .map((s) => s.trim())
    .filter(Boolean);

  const seen = new Set();
  const items = [];
  for (const it of rawItems) {
    const key = it.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      items.push(it);
    }
  }

  const normalized = items.map((item) => {
    if (!item) return item;
    if (item.toUpperCase() === item) return item;
    // light title case: first letter of each word
    return item
      .split(/\s+/)
      .map((w) =>
        w.length === 0
          ? w
          : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
      )
      .join(" ");
  });

  const body = isTurkish
    ? "• " + normalized.join("\n• ")
    : "• " + normalized.join("\n• ");

  const hints =
    (isTurkish ? "\n\nNotlar:\n" : "\n\nNotes:\n") +
    (isTurkish
      ? "• 6–14 arası net ve iş dünyasında karşılığı olan uzmanlık alanı seçmeye çalış.\n" +
        "• Çok genel ifadeleri (örn. 'Problem çözme') mümkünse daha somut alanlarla birleştir.\n" +
        "• Hedeflediğin rol(ler) ile en alakalı uzmanlıkları ilk sıralara yaz."
      : "• Aim for 6–14 clear, employer-relevant areas of expertise.\n" +
        "• Merge overly generic items (e.g., 'Problem Solving') into more concrete domains where possible.\n" +
        "• Put the expertise areas most relevant to your target roles at the top.");

  return header + body + hints;
}

/**
 * Local mock for Publications / Rewards (Awards) section
 * Presents them as a credible bullet list.
 */
function simpleImprovedPublishesLocal(publishesText, language) {
  const isTurkish = language === "tr";
  const base = (publishesText || "").trim();

  const header = isTurkish
    ? "Yayınlar ve ödüller bölümü (local mock ile hafifçe yapılandırıldı):\n\n"
    : "Publications & Awards section (lightly structured via local mock):\n\n";

  if (!base) {
    return (
      header +
      (isTurkish
        ? "Metin boş görünüyor. Lütfen önemli gördüğün yayınlarını, konuşmalarını veya kariyerle ilgili ödüllerini ekle."
        : "The text seems empty. Please add any important publications, talks, or career-relevant awards.")
    );
  }

  const lines = base
    .split(/\n+/g)
    .map((l) => l.trim())
    .filter(Boolean);

  const improvedLines = lines.map((line) => {
    let tweaked = line;

    if (!isTurkish) {
      tweaked = tweaked.replace(/\bgot\b/gi, "received");
      tweaked = tweaked.replace(/\bwon\b/gi, "was awarded");
    } else {
      tweaked = tweaked.replace(/\baldım\b/gi, "ile ödüllendirildim");
      tweaked = tweaked.replace(/\bkazandım\b/gi, "ödülüne layık görüldüm");
    }

    if (/^[•\-]/.test(tweaked)) {
      return tweaked;
    }
    return "• " + tweaked;
  });

  const body = improvedLines.join("\n");

  const hints =
    (isTurkish ? "\n\nNotlar:\n" : "\n\nNotes:\n") +
    (isTurkish
      ? "• Her bir madde için mümkünse; eser/ödül adı, kurum/etkinlik ve yılı belirt.\n" +
        "• Hedeflediğin kariyer alanıyla en ilgili yayın ve ödülleri en üste yerleştir.\n" +
        "• Akademik olmayan ama kariyere katkı sunan ödülleri de (örn. şirket içi başarı ödülleri) ekleyebilirsin."
      : "• For each item, include where possible: title/name, venue/organization, and year.\n" +
        "• Put the publications and awards that are most relevant to your target career path at the top.\n" +
        "• It’s okay to include non-academic but career-relevant awards (e.g., internal company performance awards).");

  return header + body + hints;
}

/**
 * Local mock for Work Details section
 * Takes raw bullet-style responsibilities/achievements and lightly polishes them.
 */
function simpleImprovedWorkDetailsLocal(workDetailsText, language) {
  const isTurkish = language === "tr";
  const base = (workDetailsText || "").trim();

  const header = isTurkish
    ? "İş sorumlulukları ve başarılar bölümü (local mock ile hafifçe güçlendirildi):\n\n"
    : "Work responsibilities & achievements section (lightly strengthened via local mock):\n\n";

  if (!base) {
    return (
      header +
      (isTurkish
        ? "Metin boş görünüyor. Lütfen bu pozisyondaki görevlerini ve elde ettiğin sonuçları madde madde yaz."
        : "The text seems empty. Please provide your responsibilities and achievements in this role as bullet-style lines.")
    );
  }

  const lines = base
    .split(/\n+/g)
    .map((l) => l.trim())
    .filter(Boolean);

  const improvedLines = lines.map((line) => {
    let tweaked = line;

    if (!isTurkish) {
      tweaked = tweaked.replace(/\bresponsible for\b/gi, "led");
      tweaked = tweaked.replace(/\bhelped\b/gi, "contributed to");
      tweaked = tweaked.replace(/\bworked on\b/gi, "delivered on");
    } else {
      tweaked = tweaked.replace(/\bsorumluydum\b/gi, "liderlik ettim");
      tweaked = tweaked.replace(/\bsorumluydum\./gi, "liderlik ettim.");
      tweaked = tweaked.replace(/\byardımcı oldum\b/gi, "katkı sağladım");
      tweaked = tweaked.replace(/\büzerinde çalıştım\b/gi, "teslim ettim");
    }

    // Ensure bullet
    if (/^[•\-]/.test(tweaked)) {
      return tweaked;
    }
    return "• " + tweaked;
  });

  const body = improvedLines.join("\n");

  const hints =
    (isTurkish ? "\n\nNotlar:\n" : "\n\nNotes:\n") +
    (isTurkish
      ? "• Her maddeyi güçlü bir fiille başlat (örn. 'tasarladım', 'optimize ettim', 'yönettim').\n" +
        "• Mümkün olduğunda somut metrikler ekle (örn. '%20 performans artışı', 'yanıt sürelerinde 2x iyileşme').\n" +
        "• Sadece görev değil, sonuç ve etkiyi de vurgula (müşteri memnuniyeti, gelir artışı, hata oranı vb.)."
      : "• Start each bullet with a strong verb (e.g., 'designed', 'optimized', 'led').\n" +
        "• Add concrete metrics wherever possible (e.g., '20% performance improvement', '2x faster response time').\n" +
        "• Emphasize impact, not just tasks (customer satisfaction, revenue, quality, speed).");

  return header + body + hints;
}

/**
 * Local mock for Education Details section
 * Turns messy notes about education into clearer bullet-style highlights.
 */
function simpleImprovedEduDetailsLocal(eduDetailsText, language) {
  const isTurkish = language === "tr";
  const base = (eduDetailsText || "").trim();

  const header = isTurkish
    ? "Eğitim detayları bölümü (local mock ile hafifçe yapılandırıldı):\n\n"
    : "Education details section (lightly structured via local mock):\n\n";

  if (!base) {
    return (
      header +
      (isTurkish
        ? "Metin boş görünüyor. Lütfen önemli dersler, projeler, tez, onur dereceleri veya kulüp faaliyetlerini ekle."
        : "The text seems empty. Please add key coursework, projects, thesis, honors, or relevant extracurriculars.")
    );
  }

  const lines = base
    .split(/\n+/g)
    .map((l) => l.trim())
    .filter(Boolean);

  const improvedLines = lines.map((line) => {
    let tweaked = line;

    if (!isTurkish) {
      tweaked = tweaked.replace(/\bgot\b/gi, "earned");
      tweaked = tweaked.replace(/\bfinished\b/gi, "completed");
    } else {
      tweaked = tweaked.replace(/\bbitirdim\b/gi, "tamamladım");
      tweaked = tweaked.replace(/\baldım\b/gi, "tamamladım");
    }

    if (/^[•\-]/.test(tweaked)) {
      return tweaked;
    }
    return "• " + tweaked;
  });

  const body = improvedLines.join("\n");

  const hints =
    (isTurkish ? "\n\nNotlar:\n" : "\n\nNotes:\n") +
    (isTurkish
      ? "• İlgili dersler ve projeleri, hedeflediğin rolle en alakalı olacak şekilde seç.\n" +
        "• Not ortalaması (GPA), onur dereceleri veya burslar gibi güçlü göstergeleri eklemeyi düşün.\n" +
        "• Kulüp ve topluluk faaliyetlerini, somut sorumluluk ve katkılarla birlikte yaz."
      : "• Select coursework and projects that are most relevant to your target roles.\n" +
        "• Consider including GPA, honors, or scholarships if they strengthen your profile.\n" +
        "• For clubs and student activities, mention concrete responsibilities and impact.");

  return header + body + hints;
}

module.exports = {
  simpleLocalOptimize,
  simpleJobMatchLocal,
  simpleCoverLetterLocal,
  simpleInterviewFeedbackLocal,
  simpleInterviewQuestionsLocal,
  simpleBulletRewriteLocal,
  simpleJobAnalysisLocal,
  simpleLinkedInOptimizeLocal,
  simpleImprovedAboutMeLocal,
  simpleImprovedSkillsLocal,
  simpleImprovedProjectsLocal,
  simpleImprovedExpertiseLocal,
  simpleImprovedPublishesLocal,
  simpleImprovedWorkDetailsLocal,
  simpleImprovedEduDetailsLocal
};