// app/screens/ResumeEditorScreen.js
import React, { useContext, useMemo, useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert, Modal } from "react-native";
import { AppContext, saveDocument } from "../context/AppContext";
import { improveAboutMe, improveSkillsSection, improveProjectsSection, improveExpertiseSection, improvePublishesSection } from "../utils/api";

const AI_CHAR_LIMIT = 20000;

// Default order / base metadata for fields we care about
const BASE_FIELDS = [
  { 
    key: "name",
    label: "Full Name",
    isForAi: false,
    isModalField: false
  },
  {
    key: "headline",
    label: "Job Title / Headline",
    placeholder: "e.g., Senior Account Executive",
    isForAi: false,
    isModalField: false
  },
  {
    key: "aboutMe",
    label: "About Me",
    placeholder: "Short professional summary or profile section at the top of your resume.",
    isForAi: true,
    multiline: true,
    isModalField: false
  },
  {
    key: "contact",
    label: "Contact Info",
    placeholder: "Email, phone, LinkedIn, location, portfolio, etc.",
    isForAi: false,
    multiline: true,
    isModalField: true
  },
  {
    key: "experience",
    label: "Work Experience",
    placeholder: "Roles, companies, dates and bullet points describing your responsibilities & impact.",
    isForAi: false,
    multiline: true,
    isModalField: true
  },
  {
    key: "education",
    label: "Education",
    placeholder: "Degrees, institutions, graduation years, key coursework or achievements.",
    isForAi: false,
    multiline: true,
    isModalField: true
  },
  {
    key: "skills",
    label: "Skills",
    placeholder: "Hard skills, tools, technologies and languages. You can separate with commas or bullets.",
    isForAi: true,
    multiline: true,
    isModalField: false
  },
  {
    key: "projects",
    label: "Projects",
    placeholder: "Key projects, portfolio items, open source, side products – especially useful for creative/tech roles.",
    isForAi: true,
    isModalField: false,
    multiline: true,
  },
  {
    key: "languages",
    label: "Languages",
    placeholder: "Spoken languages for business communication.",
    isForAi: false,
    multiline: true,
    isModalField: false
  },
  {
    key: "expertise",
    label: "Expertise",
    placeholder: "Areas of expertise where you feel confident (e.g., Enterprise Salesforce Architecture).",
    isForAi: true,
    multiline: true,
    isModalField: false
  },
  {
    key: "certificates",
    label: "Certificates",
    placeholder: "Official certificates you hold to display your experience / knowledge in a particular area.",
    isForAi: false,
    multiline: true,
    isModalField: true
  },
  {
    key: "publishes",
    label: "Published Works / Rewards",
    placeholder: "Any kind of reward you received or any published, acclaimed work.",
    isForAi: true,
    multiline: true,
    isModalField: false
  },
  {
    key: "referrals",
    label: "Referrals",
    placeholder: "Referrals from a previous work place or a relevant person to endorse your skills / experience.",
    isForAi: false,
    multiline: true,
    isModalField: true
  },
];

const DEFAULT_MODAL_DATA = {
  company: "",
  title: "",
  institution: "",
  degree: "",
  startDate: "",
  endDate: "",
  email: "",
  mobile: "",
  address: "",
  website: "",
  linkedin: "",

  certName: "",
  issuer: "",
  url: "",

  refName: "",
  company: "",
  contact: "",
  
  isCurrent: false,
  details: "",
};

const MODAL_CONFIGS = {
  experience: {
    title: "Work Experience",
    aiSectionKey: "experience_details",
    primary1Label: "Company Name",
    primary1Key: "company",
    primary1Placeholder: "e.g., Intech Consulting",
    primary2Label: "Job Title",
    primary2Key: "title",
    primary2Placeholder: "e.g., Senior Salesforce Consultant",
    supportsCurrent: true,
    supportsDates: true,
    supportsAI: true,

    parse: (value) => {
      const data = { ...DEFAULT_MODAL_DATA };
      if (!value) return data;

      const lines = value
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      if (!lines.length) return data;

      // Line 1: "Title, Company"
      const header = lines[0] || "";
      const [maybeTitle, maybeCompany] = header.split(",").map((s) => s.trim());
      if (maybeTitle) data.title = maybeTitle;
      if (maybeCompany) data.company = maybeCompany;

      // Line 2: "Start – End"
      const dateLine = lines[1] || "";
      if (dateLine && /–|-/.test(dateLine)) {
        const [start, end] = dateLine.split(/[–-]/).map((s) => s.trim());
        data.startDate = start || "";
        if (end && /current/i.test(end)) {
          data.isCurrent = true;
          data.endDate = "";
        } else {
          data.endDate = end || "";
        }
        data.details = lines.slice(2).join("\n");
      } else {
        data.details = lines.slice(1).join("\n");
      }

      return data;
    },
    format: (data, previousValue, mode) => {
      const { company, title, startDate, endDate, isCurrent, details } = data;

      const datePart = isCurrent
        ? `${startDate || "Start"} – Current`
        : startDate || endDate
        ? `${startDate || ""} – ${endDate || ""}`
        : "";

      const headerLine = [title, company].filter(Boolean).join(", ");
      const lines = [];

      if (headerLine) lines.push(headerLine);
      if (datePart) lines.push(datePart);
      if (details?.trim()) lines.push("", details.trim());

      const block = lines.join("\n");

      let prev = previousValue || "";

      // ✨ Enforce ONLY ONE current job:
      // if this entry is marked current, strip "Current" from all other entries first.
      if (isCurrent && prev.trim()) {
        prev = stripCurrentFromExperience(prev);
      }

      // Edit mode replaces the whole field with this block
      if (mode === "edit" || !prev.trim()) return block;

      // Create mode appends as a new block
      return `${prev.trim()}\n\n${block}`;
    },
  },

  education: {
    title: "Education",
    aiSectionKey: "education_details",
    primary1Label: "Institution",
    primary1Key: "institution",
    primary1Placeholder: "e.g., University of X",
    primary2Label: "Degree / Program",
    primary2Key: "degree",
    primary2Placeholder: "e.g., BSc Computer Science",
    supportsCurrent: false,
    supportsDates: true,
    supportsAI: true,

    parse: (value) => {
      const data = { ...DEFAULT_MODAL_DATA };
      if (!value) return data;

      const lines = value
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      if (!lines.length) return data;

      // Line 1: "Degree, Institution" OR "Institution, Degree" – we don't care order much
      const header = lines[0] || "";
      const [first, second] = header.split(",").map((s) => s.trim());
      // naive mapping
      data.degree = first || "";
      data.institution = second || "";

      const dateLine = lines[1] || "";
      if (dateLine && /–|-/.test(dateLine)) {
        const [start, end] = dateLine.split(/[–-]/).map((s) => s.trim());
        data.startDate = start || "";
        data.endDate = end || "";
        data.details = lines.slice(2).join("\n");
      } else {
        data.details = lines.slice(1).join("\n");
      }

      return data;
    },
    format: (data, previousValue, mode) => {
      const { institution, degree, startDate, endDate, details } = data;

      const datePart =
        startDate || endDate ? `${startDate || ""} – ${endDate || ""}` : "";

      const headerLine = [degree, institution].filter(Boolean).join(", ");
      const lines = [];

      if (headerLine) lines.push(headerLine);
      if (datePart) lines.push(datePart);
      if (details?.trim()) lines.push("", details.trim());

      const block = lines.join("\n");

      if (mode === "edit" || !previousValue?.trim()) return block;

      return `${previousValue.trim()}\n\n${block}`;
    },
  },

  contact: {
    title: "Contact Info",
    aiSectionKey: "contact_info",
    primary1Label: "Email Address",
    primary1Key: "email",
    primary1Placeholder: "",
    primary2Label: "Mobile Phone",
    primary2Key: "mobile",
    primary2Placeholder: "",
    primary3Label: "Address",
    primary3Key: "address",
    primary3Placeholder: "",
    primary4Label: "Website",
    primary4Key: "website",
    primary4Placeholder: "",
    primary5Label: "LinkedIn",
    primary5Key: "linkedin",
    primary5Placeholder: "",
    supportsDates: false,
    supportsCurrent: false,
    supportsAI: false,

    parse: (value) => {
      const data = { ...DEFAULT_MODAL_DATA };
      if (!value) return data;

      const lines = value
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      if (!lines.length) return data;

      const header = lines[0] || "";
      const [first, second, third] = header.split(",").map((s) => s.trim());
      // naive mapping
      data.email = first || "";
      data.mobile = second || "";
      data.address = third || "";

      return data;
    },
    format: (data, previousValue, mode) => {
      const { email, mobile, address } = data;

      const headerLine = [email, mobile, address].filter(Boolean).join(", ");
      const lines = [];

      if (headerLine) lines.push(headerLine);

      const block = lines.join("\n");

      if (mode === "edit" || !previousValue?.trim()) return block;

      return `${previousValue.trim()}\n\n${block}`;
    },
  },

  certificates: {
    title: "Certificates",
    aiSectionKey: "certificates",
    primary1Label: "Certificate Name",
    primary1Key: "certName",
    primary1Placeholder: "",
    primary2Label: "Issued By",
    primary2Key: "issuer",
    primary2Placeholder: "",
    primary3Label: "Confirmation URL",
    primary3Key: "url",
    primary3Placeholder: "",
    supportsDates: false,
    supportsCurrent: false,
    supportsAI: false,

    parse: (value) => {
      const data = { ...DEFAULT_MODAL_DATA };
      if (!value) return data;

      const lines = value
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      if (!lines.length) return data;

      const header = lines[0] || "";
      const [first, second, third ] = header.split(",").map((s) => s.trim());
      // naive mapping
      data.certName = first || "";
      data.issuer = second || "";
      data.url = third || "";

      return data;
    },
    format: (data, previousValue, mode) => {
      const { certName, issuer, url } = data;

      const headerLine = [certName, issuer, url].filter(Boolean).join(", ");
      const lines = [];

      if (headerLine) lines.push(headerLine);

      const block = lines.join("\n");

      if (mode === "edit" || !previousValue?.trim()) return block;

      return `${previousValue.trim()}\n\n${block}`;
    },
  },

  referrals: {
    title: "Referrals",
    aiSectionKey: "referrals",
    primary1Label: "Referral Name",
    primary1Key: "refName",
    primary1Placeholder: "",
    primary2Label: "Company",
    primary2Key: "company",
    primary2Placeholder: "",
    primary3Label: "Contact Info",
    primary3Key: "contact",
    primary3Placeholder: "",
    supportsDates: false,
    supportsCurrent: false,
    supportsAI: false,

    parse: (value) => {
      const data = { ...DEFAULT_MODAL_DATA };
      if (!value) return data;

      const lines = value
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      if (!lines.length) return data;

      const header = lines[0] || "";
      const [first, second, third ] = header.split(",").map((s) => s.trim());
      // naive mapping
      data.refName = first || "";
      data.company = second || "";
      data.contact = third || "";

      return data;
    },
    format: (data, previousValue, mode) => {
      const { refName, company, contact } = data;

      const headerLine = [refName, company, contact].filter(Boolean).join(", ");
      const lines = [];

      if (headerLine) lines.push(headerLine);

      const block = lines.join("\n");

      if (mode === "edit" || !previousValue?.trim()) return block;

      return `${previousValue.trim()}\n\n${block}`;
    },
  }
};

const stripCurrentFromExperience = (text = "") => {
  if (!text.trim()) return text;

  return text
    .split("\n")
    .map((line) => {
      // If a line looks like "06/2020 – Current" (or "- Current"), make it "06/2020"
      if (/current/i.test(line) && /–|-/.test(line)) {
        const [startPart] = line.split(/[–-]/);
        return startPart.trim();
      }
      return line;
    })
    .join("\n");
};

const AI_API_BY_FIELD = {
  aboutMe: improveAboutMe,
  skills: improveSkillsSection,
  projects: improveProjectsSection,
  expertise: improveExpertiseSection,
  publishes: improvePublishesSection,
};

export default function ResumeEditorScreen({ route, navigation }) {
  const { theme, isPro, freeCreditsLeft, consumeCredit, language, setLanguage, } = useContext(AppContext);
  const { mode, initialTitle, initialSections, sourceFileName, meta, resumeId, } = route.params || {}; 
  const [docTitle, setDocTitle] = useState( initialTitle || "Imported Resume" );
  const [loadingFieldKey, setLoadingFieldKey] = useState(null);
  const [savingDoc, setSavingDoc] = useState(false);

  const [fields, setFields] = useState(
    BASE_FIELDS.map((f) => ({
    ...f,
    value: "",
    savedValue: "",
  }))
  );

  const isTurkish = language === "tr";
  const disclaimer = isTurkish ? "*AI tarafından üretilmiştir. Başvurmadan önce lütfen gözden geçirin." : "*AI-generated. Please review before using in applications.";
  
  // 🔹 Generic modal state
  const [activeModalField, setActiveModalField] = useState(null); // "experience" | "education" | "contact" | etc.
  const [modalMode, setModalMode] = useState("create"); // "create" | "edit"
  const [modalData, setModalData] = useState(DEFAULT_MODAL_DATA);
  const [loadingModalAi, setLoadingModalAi] = useState(false);

  // ---------- Init fields from initialSections ----------
  useEffect(() => {
    // Start from base config, then merge in server values
    const sectionMap = {};
    if (Array.isArray(initialSections)) {
      initialSections.forEach((s) => {
        if (s && s.key) {
          sectionMap[s.key] = s.value || "";
        }
      });
    }

    const baseMapped = BASE_FIELDS.map((cfg) => ({
      ...cfg,
      value: sectionMap[cfg.key] || "",
      savedValue: "",
    }));

    // Include any unknown sections returned by backend as extra fields
    const knownKeys = new Set(BASE_FIELDS.map((c) => c.key));
    const extras =
      (initialSections || []).filter((s) => s && !knownKeys.has(s.key)) || [];

    const extraFields = extras.map((s) => ({
      key: s.key,
      label: s.label || s.key,
      value: s.value || "",
      placeholder: "",
      isForAi: false,
      multiline: true,
      savedValue: "",
    }));

    setFields([...baseMapped, ...extraFields]);
  }, [initialSections]);

  // ---------- Helpers ----------
  const updateFieldValue = (key, text) => {
    setFields((prev) => prev.map((f) => f.key === key ? { ...f, value: text } : f));
  };

  const checkPaywall = () => {
    if (isPro) return true;
    if (freeCreditsLeft <= 0) {
      Alert.alert(
        isTurkish ? "Limit doldu" : "Limit reached",
        isTurkish
          ? "Tüm ücretsiz hakları kullandın. Sınırsız erişim için Pro'ya yükselt."
          : "You’ve used all free credits. Upgrade to Pro for unlimited access."
      );
      return false;
    }
    consumeCredit();
    return true;
  };

  const previewData = useMemo(() => {
    const get = (key) =>
      fields.find((f) => f.key === key)?.value.trim() || "";

    return {
      name: get("name"),
      headline: get("headline"),
      aboutMe: get("aboutMe"),
      contact: get("contact"),
      experience: get("experience"),
      education: get("education"),
      skills: get("skills"),
      projects: get("projects"),
      languages: get("languages"),
      expertise: get("expertise"),
      certificates: get("certificates"),
      publishes: get("publishes"),
      referrals: get("referrals"),
    };
  }, [fields]);

  const buildPreviewText = () => {
    const lines = [];

    if (docTitle?.trim()) lines.push(docTitle.trim());
    lines.push("");

    fields.forEach((f) => {
      if (!f.value?.trim()) return;
      lines.push(f.label || f.key);
      lines.push(f.value.trim());
      lines.push("");
    });

    return lines.join("\n");
  };

  const handleSaveDocument = async () => {
    try {
      setSavingDoc(true);

      // 1) Update original resume sections (if this came from upload AND we have a resumeId)
      if (resumeId) {
        const sectionsPayload = fields.map((f) => ({
          key: f.key,
          label: f.label,
          value: f.value || "",
        }));

        await fetch( "https://resume-iq-2p17.onrender.com/resumes/" + resumeId + "/sections", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sections: sectionsPayload }),
          }
        );
      }

      // 2) Save pretty text snapshot into My Documents
      const content = buildPreviewText();

      await saveDocument({
        title: docTitle || "Imported Resume",
        type: "resume",
        content,
      });

      const message = resumeId
        ? isTurkish
          ? "CV'in hem orijinal dosyada hem de My Documents bölümünde güncellendi."
          : "Your resume has been updated in the original file and saved to My Documents."
        : isTurkish
        ? "CV'in My Documents bölümüne kaydedildi."
        : "Your resume has been saved to My Documents.";

      Alert.alert(isTurkish ? "Kaydedildi" : "Saved", message);
    } catch (e) {
      console.log("saveDocument error", e);
      Alert.alert(
        isTurkish ? "Hata" : "Error",
        isTurkish
          ? "Belge kaydedilemedi. Lütfen tekrar deneyin."
          : "Could not save this document. Please try again."
      );
    } finally {
      setSavingDoc(false);
    }
  };

  const handleImproveWithAi = async (field) => {
    if (!checkPaywall()) return;

    const rawText = field?.value ?? "";
    if (!rawText.trim()) {
      Alert.alert(
        isTurkish ? "Uyarı" : "Warning",
        isTurkish
          ? "Lütfen önce metninizi girin."
          : "Please input text first."
      );
      return;
    }

    if (rawText.length > AI_CHAR_LIMIT) {
      Alert.alert(
        isTurkish ? "Metin çok uzun" : "Text too long",
        isTurkish
          ? `Maksimum ${AI_CHAR_LIMIT} karaktere kadar destekleniyor.`
          : `Maximum supported length is ${AI_CHAR_LIMIT} characters.`
      );
      return;
    }

    const apiFn = AI_API_BY_FIELD[field.key];
    if (!apiFn) {
      Alert.alert(
        "AI Not Configured",
        `AI is not configured for field "${field.key}".`
      );
      return;
    }

    try {
      setLoadingFieldKey(field.key);

      const data = await apiFn({ rawText, language });
      if (!data || !data.optimizedText) {
        throw new Error("Missing optimizedText in response");
      }

      const nextText = data.optimizedText;
      updateFieldValue(field.key, nextText);
    } catch (e) {
      console.log("Improve with AI error", e);
      Alert.alert(
        isTurkish ? "AI Hatası" : "AI Error",
        isTurkish
          ? "Metin iyileştirilemedi. Lütfen tekrar deneyin."
          : "We couldn't generate improved details. Please try again."
      );
    } finally {
      setLoadingFieldKey(null);
    }
  };

  const handleModalAi = async (field) => {
    if (typeof checkPaywall === "function") {
      if (!checkPaywall()) return;
    }
    const rawText = modalData.details;
    if (!rawText.trim()) {
      Alert.alert( language === "tr" ? "Uyarı" : "Warning", language === "tr" ? "Lütfen metninizi girin." : "Please input text first.");
      return;
    }

    if (rawText.length > AI_CHAR_LIMIT) {
      Alert.alert(
        language === "tr" ? "Metin çok uzun" : "Text too long",
        language === "tr"
          ? `Maksimum ${AI_CHAR_LIMIT} karaktere kadar destekleniyor.`
          : `Maximum supported length is ${AI_CHAR_LIMIT} characters.`
      );
      return;
    }

    const apiFn = AI_API_BY_FIELD[field.aiSectionKey];
    if (!apiFn) { 
      Alert.alert( "AI Not Configured", `AI is not configured for field "${field.aiSectionKey}".` );
      return;
    }

    try {
      setLoadingModalAi(true);
      const data = await apiFn({ rawText, language, });

      if (!data || !data.optimizedText) {
        throw new Error("Missing optimizedText in response");
      }

      setModalData((prev) => ({
        ...prev,
        details: data.optimizedText,
      }));

      setLoadingModalAi(false);
    } catch (e) {
      console.log("modal AI error", e);
      Alert.alert(
        "AI Error",
        "We couldn't generate improved details. Please try again."
      );
    } finally {
      setLoadingModalAi(false);
    }
  };

  const openModal = (field, mode) => {
    const config = MODAL_CONFIGS[field.key];
    if (!config) {
      console.log("No modal config for field", field.key);
      return;
    }

    setModalMode(mode);
    setActiveModalField(field.key);

    if (mode === "edit" && field.value) {
      const parsed = config.parse
        ? config.parse(field.value)
        : { ...DEFAULT_MODAL_DATA, details: field.value };
      setModalData(parsed);
    } else {
      setModalData({ ...DEFAULT_MODAL_DATA });
    }
  };

  const closeModal = () => {
    setActiveModalField(null);
    setModalData({ ...DEFAULT_MODAL_DATA });
    setLoadingModalAi(false);
  };

  const toggleCurrent = () => {
    setModalData((prev) => ({
      ...prev,
      isCurrent: !prev.isCurrent,
      endDate: !prev.isCurrent ? "" : prev.endDate,
    }));
  };

  const headerTitle = mode === "upload" ? isTurkish ? "Yüklenen CV Editörü" : "Uploaded Resume Editor" : isTurkish ? "CV Editörü" : "Resume Editor";

  // ---------- Render ----------
  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]} >
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]} >
          {headerTitle}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Title input + file/meta pill */}
      <View style={styles.titleRow}>
        <TextInput style={[ styles.titleInput, { color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.bgCard, }, ]}
          value={docTitle} onChangeText={setDocTitle} placeholder={ isTurkish ? "Belge başlığı" : "Document title (optional)" } placeholderTextColor={theme.textSecondary} />
        {(sourceFileName || meta) && (
          <View style={[ styles.metaPill, { borderColor: theme.border, backgroundColor: theme.bgCard, }, ]} >
            <Text style={[ styles.metaPillText, { color: theme.textSecondary }, ]} numberOfLines={1} >
              {sourceFileName || "Imported file"}
            </Text>
          </View>
        )}
      </View>

      {/* Sub-header: disclaimer + language toggle */}
      <View style={styles.subHeaderRow}>
        <Text style={[ styles.subtitle, { color: theme.textSecondary, flex: 1 }, ]} numberOfLines={2} >
          {disclaimer}
        </Text>

        <View style={styles.languageToggleWrapper}>
          <TouchableOpacity style={[ styles.languageButton, isTurkish && styles.languageButtonActive, ]} onPress={() => setLanguage("tr")} >
            <Text style={[ styles.languageButtonText, isTurkish && styles.languageButtonTextActive, ]} >
              TR
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[ styles.languageButton, !isTurkish && styles.languageButtonActive, ]} onPress={() => setLanguage("en")} >
            <Text style={[ styles.languageButtonText, !isTurkish && styles.languageButtonTextActive, ]} >
              EN
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Fields */}
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 120 }} keyboardShouldPersistTaps="handled" >
        {fields.map((field) => {
          const isValidForAI = field.isForAi;
          const isMultiline = !!field.multiline;
          const isModalField = field.isModalField;
          const fieldHasValue = !!field.value?.trim();
          const modalConfig = MODAL_CONFIGS[field.key];

          return (
            <View key={field.key} style={[ styles.fieldCard, { backgroundColor: theme.bgCard, borderColor: theme.border, }, ]} >
              <View style={styles.fieldHeader}>
                <Text style={[ styles.fieldLabel, { color: theme.textPrimary }, ]} >
                  {field.label}
                </Text>

                <View style={styles.fieldHeaderButtons}>
                  {isValidForAI && (
                    <TouchableOpacity style={[ styles.aiButton, { borderColor: theme.accent }, ]} onPress={() => handleImproveWithAi(field)} disabled={loadingFieldKey === field.key} >
                      {loadingFieldKey === field.key ? (
                        <ActivityIndicator size="small" />) : (
                        <Text style={[ styles.aiButtonText, { color: theme.accent }, ]} >
                          ✨{" "} {isTurkish ? "AI ile iyileştir" : "Improve with AI"}
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
                  {isModalField && modalConfig && (
                    <TouchableOpacity style={[ styles.smallIconButton, { borderColor: theme.border }, ]} onPress={() => openModal(field, "create")} >
                      <Text style={[ styles.smallIconButtonText, { color: theme.textPrimary }, ]} > + </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {field.placeholder ? (
                <Text style={[ styles.helperText, { color: theme.textSecondary }, ]} >
                  {field.placeholder}
                </Text>
              ) : null}

              {!isModalField ? (
                <View style={{ position: "relative" }}>
                  <TextInput style={[ styles.textInput, { color: theme.textPrimary, borderColor: theme.border, minHeight: isMultiline ? 80 : 40, backgroundColor: theme.bg, }, ]}
                    multiline={isMultiline} value={field.value} onChangeText={(text) => updateFieldValue(field.key, text) } maxLength={isValidForAI ? AI_CHAR_LIMIT : undefined} textAlignVertical={isMultiline ? "top" : "center"} />

                  {isValidForAI && (
                    <Text style={styles.charCounter}>
                      {field.value?.length || 0} / {AI_CHAR_LIMIT}
                    </Text>
                  )}
                </View>) : (
                <TouchableOpacity activeOpacity={0.9} onPress={() => openModal( field, fieldHasValue ? "edit" : "create" ) } style={[ styles.readOnlyBox, { borderColor: theme.border }, ]} >
                  <Text style={{ color: fieldHasValue ? theme.textPrimary : theme.textSecondary, fontSize: 13, }} >
                    {fieldHasValue ? field.value : "No details added yet. Tap to add more details."}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Footer actions */}
      <View style={[ styles.footer, { backgroundColor: theme.bg }, ]} >
        <TouchableOpacity style={[ styles.footerButton, styles.saveButton, { backgroundColor: theme.accent }, ]}
          onPress={handleSaveDocument} disabled={savingDoc} >
          {savingDoc ? (
            <ActivityIndicator color={theme.textOnAccent} />
          ) : (
            <Text style={[ styles.saveText, { color: theme.textOnAccent }, ]} >
              {isTurkish ? "My Documents'a kaydet" : "Save to Documents"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 8,
    justifyContent: "space-between",
  },
  backText: { fontSize: 14 },
  headerTitle: { fontSize: 18, fontWeight: "600" },

  titleRow: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  titleInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 6,
  },
  metaPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  metaPillText: {
    fontSize: 11,
  },

  subHeaderRow: {
    paddingHorizontal: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  subtitle: { fontSize: 12 },
  scroll: { flex: 1, paddingHorizontal: 16, marginTop: 4 },

  fieldCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  fieldHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fieldLabel: { fontSize: 14, fontWeight: "600" },
  helperText: { fontSize: 11, marginTop: 4, marginBottom: 6 },

  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    marginBottom: 6,
  },
  fieldHeaderButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  aiButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  aiButtonText: { fontSize: 11, fontWeight: "600" },
  charCounter: {
    position: "absolute",
    right: 10,
    bottom: 4,
    color: "#9ca3af",
    fontSize: 11,
  },

  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    gap: 10,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  previewButton: { borderWidth: 1 },
  saveButton: {},
  previewText: { fontSize: 13, fontWeight: "500" },
  saveText: { fontSize: 13, fontWeight: "600" },

  // Preview
  previewContainer: { flex: 1 },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 8,
    justifyContent: "space-between",
  },
  previewTitle: { fontSize: 18, fontWeight: "600" },
  previewScroll: { paddingHorizontal: 16, paddingTop: 8 },

  pvPage: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.5)",
    padding: 14,
    backgroundColor: "#020617",
  },
  pvHeaderClassic: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148,163,184,0.4)",
    paddingBottom: 6,
  },
  pvName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#e5e7eb",
  },
  pvHeadline: {
    fontSize: 13,
    color: "#9ca3af",
  },
  pvSection: {
    marginTop: 8,
  },
  pvSectionTitle: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#9ca3af",
    marginBottom: 4,
  },
  pvSectionBody: {
    fontSize: 12,
    color: "#e5e7eb",
    lineHeight: 18,
  },
  pvChipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  pvChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.7)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 4,
  },
  pvChipText: {
    fontSize: 11,
    color: "#e5e7eb",
  },
  pvContactBlock: {
    marginTop: 6,
  },
  pvContactText: {
    fontSize: 11,
    color: "#9ca3af",
  },

  // Language toggle
  languageToggleWrapper: {
    flexDirection: "row",
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#1f2937",
    overflow: "hidden",
  },
  languageButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: "transparent",
  },
  languageButtonActive: {
    backgroundColor: "#111827",
  },
  languageButtonText: {
    color: "#9ca3af",
    fontSize: 13,
    fontWeight: "500",
  },
  languageButtonTextActive: {
    color: "#e5e7eb",
  },
});
