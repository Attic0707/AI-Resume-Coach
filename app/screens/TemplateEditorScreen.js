// app/screens/TemplateEditorScreen.js
import React, { useContext, useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert, Modal, } from "react-native";
import { AppContext, saveDocument } from "../context/AppContext";
import { improveAboutMe, improveSkillsSection, improveProjectsSection, improveExpertiseSection, improvePublishesSection, improveExperienceDetails, improveEducationDetails } from "../utils/api";

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
    isForAi: true,
    isModalField: false,
    multiline: true,
  },
  {
    key: "contact",
    label: "Contact Info",
    placeholder: "",
    isForAi: false,
    isModalField: true
  },
  {
    key: "experience",
    label: "Work Experience",
    placeholder: "List roles, companies, dates and 3–6 strong bullet points with measurable impact.",
    multiline: true,
    isForAi: false,
    isModalField: true
  },
  {
    key: "education",
    label: "Education",
    placeholder: "Degrees, institutions, graduation years, key coursework or achievements.",
    multiline: true,
    isForAi: false,
    isModalField: true
  },
  {
    key: "skills",
    label: "Skills",
    placeholder: "Hard skills, tools, technologies and languages. You can separate with commas or bullets.",
    multiline: true,
    isForAi: true,
    isModalField: false
  },
  {
    key: "projects",
    label: "Projects",
    placeholder: "Key projects, portfolio items, open source, side products – especially useful for creative/tech roles.",
    multiline: true,
    isForAi: true,
    isModalField: false
  },
  {
    key: "languages",
    label: "Languages",
    placeholder: "Spoken languages for business communication",
    multiline: true,
    isForAi: false,
    isModalField: false
  },
  {
    key: "expertise",
    label: "Expertise",
    placeholder: "Areas of experties with which you feel confident",
    multiline: true,
    isForAi: true,
    isModalField: false
  },
  {
    key: "certificates",
    label: "Certificates",
    placeholder: "Official certificates you hold to display your experience / knowledge in a particular area",
    multiline: true,
    isForAi: false,
    isModalField: true
  },
  {
    key: "publishes",
    label: "Published Works / Rewards",
    placeholder: "Any kind of reward you received or any published, acclaimed work is displayed here",
    multiline: true,
    isForAi: true,
    isModalField: false
  },
  {
    key: "referrals",
    label: "Referrals",
    placeholder: "Referrals from a previous work place or a relevant person to endorse your skills / experience",
    multiline: true,
    isForAi: false,
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
const AI_CHAR_LIMIT = 20000;

const AI_API_BY_FIELD = {
  aboutMe: improveAboutMe,
  skills: improveSkillsSection,
  projects: improveProjectsSection,
  expertise: improveExpertiseSection,
  publishes: improvePublishesSection,
  experience_details: improveExperienceDetails,
  education_details: improveEducationDetails,
};

export default function TemplateEditorScreen({ route, navigation }) {
  const { theme, isPro, freeCreditsLeft, consumeCredit, language, setLanguage } = useContext(AppContext);
  const { templateId, templateName } = route.params || {};

  const [fields, setFields] = useState(
    BASE_FIELDS.map((f) => ({
      ...f,
      value: "",
      savedValue: "",
    }))
  );

  const [loadingFieldKey, setLoadingFieldKey] = useState(null);
  const [savingDoc, setSavingDoc] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);

  const isTurkish = language === "tr";
  const disclaimer = language === "tr" ? "*AI tarafından üretilmiştir. Lütfen başvurmadan önce gözden geçirin." : "*AI-generated. Please review before using in applications.";

  // 🔹 Generic modal state
  const [activeModalField, setActiveModalField] = useState(null); // "experience" | "education" | "contact" | etc.
  const [modalMode, setModalMode] = useState("create"); // "create" | "edit"
  const [modalData, setModalData] = useState(DEFAULT_MODAL_DATA);
  const [loadingModalAi, setLoadingModalAi] = useState(false);


  const checkPaywall = () => {
    if (isPro) return true;
    if (freeCreditsLeft <= 0) {
      Alert.alert( "Limit reached",  "You’ve used all free credits. Upgrade to Pro for unlimited access.",
        [ { text: "Cancel", style: "cancel" }, { text: "Upgrade", onPress: () => navigation.navigate("Upgrade")}]);
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
      summary: get("aboutMe"),
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

  const updateFieldValue = (key, text) => {
    setFields((prev) =>
      prev.map((f) => f.key === key ? { ...f, value: text } : f));
  };

  const buildPreviewText = () => {
    const name = fields.find((f) => f.key === "name")?.value.trim();
    const headline = fields
      .find((f) => f.key === "headline")
      ?.value.trim();

    const lines = [];

    if (name) lines.push(name);
    if (headline) lines.push(headline);
    if (templateName)
      lines.push(`Template: ${templateName} (${templateId})`);
    lines.push("");

    fields.forEach((f) => {
      if (!f.value.trim()) return;
      if (f.key === "name" || f.key === "headline") return;

      lines.push(f.label);
      lines.push(f.value.trim());
      lines.push("");
    });

    return lines.join("\n");
  };

  const handleSaveDocument = async () => {
    try {
      setSavingDoc(true);
      const content = buildPreviewText();

      await saveDocument({
        title: `${templateName || "Template"} Resume`,
        type: "resume",
        content,
      });

      Alert.alert("Saved", "Your resume has been saved to My Documents.");
    } catch (e) {
      console.log("saveDocument error", e);
      Alert.alert(
        "Error",
        "Could not save this document. Please try again."
      );
    } finally {
      setSavingDoc(false);
    }
  };

  const headerTitle = templateName ? `${templateName} Template` : "Template Resume";

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

  const handleImproveWithAi = async (field) => {
    if (typeof checkPaywall === "function") {
      if (!checkPaywall()) return;
    }
    const rawText = field?.value ?? "";
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

    const apiFn = AI_API_BY_FIELD[field.key];
    if (!apiFn) { 
      Alert.alert( "AI Not Configured", `AI is not configured for field "${field.key}".` );
      return;
    }

    try {
      // start per-field loading
      setLoadingFieldKey(field.key);

      const data = await apiFn({ rawText, language, });

      if (!data || !data.optimizedText) {
        throw new Error("Missing optimizedText in response");
      }

      const nextText = data.optimizedText;
      updateFieldValue(field.key, nextText);
      setLoadingFieldKey(null);
    } catch (e) {
      console.log("Improve with AI error", e);
      Alert.alert(
        "AI Error",
        "We couldn't generate improved details. Please try again."
      );
    } finally {
      setLoadingFieldKey(null);
    }
  };

  const handleModalSave = () => {
    if (!activeModalField) return;
    const config = MODAL_CONFIGS[activeModalField];
    if (!config) {
      closeModal();
      return;
    }

    const prevValue =
      fields.find((f) => f.key === activeModalField)?.value || "";
    const formatted = config.format(modalData, prevValue, modalMode);

    updateFieldValue(activeModalField, formatted);
    closeModal();
  };

  const renderPreviewContent = () => {
    const {
      name,
      headline,
      summary,
      contact,
      experience,
      education,
      skills,
      projects,
      languages,
      expertise,
      certificates,
      publishes,
      referrals,
    } = previewData;

    const mainName = name || "Your Name";
    const mainHeadline = headline || "Target Role / Headline";

    const Section = ({ title, text, compact }) => {
      if (!text?.trim()) return null;
      return (
        <View style={compact ? styles.pvSectionCompact : styles.pvSection}>
          <Text style={styles.pvSectionTitle}>{title}</Text>
          <Text style={styles.pvSectionBody}>{text.trim()}</Text>
        </View>
      );
    };

    // turn comma / newline skills into chips
    const toChips = (text = "") =>
      text
        .split(/[,;•\n]+/g)
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 16); // don’t explode the preview

    const renderSkillChips = (text) => {
      const chips = toChips(text);
      if (!chips.length) return null;
      return (
        <View style={styles.pvChipWrap}>
          {chips.map((c, idx) => (
            <View key={idx} style={styles.pvChip}>
              <Text style={styles.pvChipText}>{c}</Text>
            </View>
          ))}
        </View>
      );
    };

    const renderContact = () => {
      if (!contact?.trim()) return null;
      return (
        <View style={styles.pvContactBlock}>
          {contact.split("\n").map((line, idx) => (
            <Text key={idx} style={styles.pvContactText}>
              {line.trim()}
            </Text>
          ))}
        </View>
      );
    };

    switch (templateId) {
      /**
       * 1) CLASSIC
       * - Single column
       * - Clean header, simple separators
       */
      case "classic":
        return (
          <View style={styles.pvPage}>
            <View style={styles.pvHeaderClassic}>
              <Text style={styles.pvName}>{mainName}</Text>
              <Text style={styles.pvHeadline}>{mainHeadline}</Text>
              {renderContact()}
            </View>

            <Section title="PROFILE" text={summary} />
            <Section title="EXPERIENCE" text={experience} />
            <Section title="EDUCATION" text={education} />

            {skills?.trim() ? (
              <View style={styles.pvSection}>
                <Text style={styles.pvSectionTitle}>SKILLS</Text>
                {renderSkillChips(skills)}
              </View>
            ) : null}

            <Section title="PROJECTS" text={projects} />
            <Section title="LANGUAGES" text={languages} />
            <Section title="AREAS OF EXPERTISE" text={expertise} />
            <Section title="CERTIFICATES" text={certificates} />
            <Section title="PUBLICATIONS & AWARDS" text={publishes} />
            <Section title="REFERRALS" text={referrals} />
          </View>
        );

      /**
       * 2) TRADITIONAL
       * - Strong header, separators between blocks
       */
      case "traditional":
        return (
          <View style={styles.pvPage}>
            <View style={styles.pvHeaderTraditional}>
              <Text style={styles.pvName}>{mainName}</Text>
              <Text style={styles.pvHeadline}>{mainHeadline}</Text>
              {renderContact()}
            </View>

            <View style={styles.pvSeparator} />
            <Section title="SUMMARY" text={summary} />
            <View style={styles.pvSeparatorThin} />
            <Section title="PROFESSIONAL EXPERIENCE" text={experience} />
            <View style={styles.pvSeparatorThin} />
            <Section title="EDUCATION" text={education} />
            <View style={styles.pvSeparatorThin} />

            {skills?.trim() ? (
              <>
                <Text style={styles.pvSectionTitle}>SKILLS</Text>
                {renderSkillChips(skills)}
                <View style={styles.pvSeparatorThin} />
              </>
            ) : null}

            <Section title="PROJECTS" text={projects} />
            <Section title="LANGUAGES" text={languages} />
            <Section title="AREAS OF EXPERTISE" text={expertise} />
            <Section title="CERTIFICATES" text={certificates} />
            <Section title="PUBLICATIONS & AWARDS" text={publishes} />
          </View>
        );

      /**
       * 3) PROFESSIONAL
       * - Header band
       * - Main column + sidebar with skills / languages / expertise
       */
      case "professional":
        return (
          <View style={styles.pvPage}>
            <View style={styles.pvHeaderBand}>
              <Text style={styles.pvNameBand}>{mainName}</Text>
              <Text style={styles.pvHeadlineBand}>{mainHeadline}</Text>
              {renderContact()}
            </View>

            <View style={styles.pvTwoCol}>
              {/* Main column */}
              <View style={styles.pvMainCol}>
                <Section title="SUMMARY" text={summary} />
                <Section title="EXPERIENCE" text={experience} />
                <Section title="PROJECTS" text={projects} />
                <Section title="EDUCATION" text={education} />
              </View>

              {/* Sidebar */}
              <View style={styles.pvSideCol}>
                {skills?.trim() ? (
                  <View style={styles.pvSideCard}>
                    <Text style={styles.pvSectionTitle}>KEY SKILLS</Text>
                    {renderSkillChips(skills)}
                  </View>
                ) : null}

                {languages?.trim() ? (
                  <View style={styles.pvSideCard}>
                    <Text style={styles.pvSectionTitle}>LANGUAGES</Text>
                    <Text style={styles.pvSectionBody}>{languages}</Text>
                  </View>
                ) : null}

                {expertise?.trim() ? (
                  <View style={styles.pvSideCard}>
                    <Text style={styles.pvSectionTitle}>EXPERTISE</Text>
                    <Text style={styles.pvSectionBody}>{expertise}</Text>
                  </View>
                ) : null}

                {certificates?.trim() ? (
                  <View style={styles.pvSideCard}>
                    <Text style={styles.pvSectionTitle}>CERTIFICATES</Text>
                    <Text style={styles.pvSectionBody}>{certificates}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        );

      /**
       * 4) CLEAR
       * - Modern header stripe
       * - Two-column with boxed right side
       */
      case "clear":
        return (
          <View style={styles.pvPage}>
            <View style={styles.pvHeaderClear}>
              <View style={styles.pvHeaderClearStripe} />
              <View>
                <Text style={styles.pvName}>{mainName}</Text>
                <Text style={styles.pvHeadline}>{mainHeadline}</Text>
                {renderContact()}
              </View>
            </View>

            <View style={styles.pvTwoCol}>
              {/* Main column */}
              <View style={styles.pvMainCol}>
                <Section title="SUMMARY" text={summary} />
                <Section title="EXPERIENCE" text={experience} />
                <Section title="PROJECTS" text={projects} />
                <Section title="EDUCATION" text={education} />
              </View>

              {/* Boxed side column */}
              <View style={styles.pvSideColBoxed}>
                {skills?.trim() ? (
                  <View style={styles.pvSideCardBoxed}>
                    <Text style={styles.pvSectionTitle}>SKILLS</Text>
                    {renderSkillChips(skills)}
                  </View>
                ) : null}

                {languages?.trim() ? (
                  <View style={styles.pvSideCardBoxed}>
                    <Text style={styles.pvSectionTitle}>LANGUAGES</Text>
                    <Text style={styles.pvSectionBody}>{languages}</Text>
                  </View>
                ) : null}

                {expertise?.trim() ? (
                  <View style={styles.pvSideCardBoxed}>
                    <Text style={styles.pvSectionTitle}>EXPERTISE</Text>
                    <Text style={styles.pvSectionBody}>{expertise}</Text>
                  </View>
                ) : null}

                {publishes?.trim() ? (
                  <View style={styles.pvSideCardBoxed}>
                    <Text style={styles.pvSectionTitle}>PUBLICATIONS</Text>
                    <Text style={styles.pvSectionBody}>{publishes}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        );

      /**
       * 5) CREATIVE
       * - Color left bar, looser sections, “featured” feel
       */
      case "creative":
        return (
          <View style={styles.pvPageCreative}>
            <View style={styles.pvCreativeLeftBar} />
            <View style={styles.pvCreativeContent}>
              <View style={styles.pvHeaderCreative}>
                <Text style={styles.pvName}>{mainName}</Text>
                <Text style={styles.pvHeadlineCreative}>{mainHeadline}</Text>
                {renderContact()}
              </View>

              <Section title="ABOUT" text={summary} />
              <Section title="HIGHLIGHT EXPERIENCE" text={experience} />
              <Section title="FEATURED PROJECTS" text={projects} />

              {skills?.trim() ? (
                <View style={styles.pvSection}>
                  <Text style={styles.pvSectionTitle}>SKILLS & TOOLS</Text>
                  {renderSkillChips(skills)}
                </View>
              ) : null}

              <Section title="EDUCATION" text={education} />
              <Section title="EXPERTISE" text={expertise} />
              <Section title="LANGUAGES" text={languages} />
              <Section title="AWARDS & PUBLICATIONS" text={publishes} />
            </View>
          </View>
        );

      // Default fallback: classic
      default:
        return (
          <View style={styles.pvPage}>
            <View style={styles.pvHeaderClassic}>
              <Text style={styles.pvName}>{mainName}</Text>
              <Text style={styles.pvHeadline}>{mainHeadline}</Text>
              {renderContact()}
            </View>
            <Section title="SUMMARY" text={summary} />
            <Section title="EXPERIENCE" text={experience} />
            <Section title="EDUCATION" text={education} />
            <Section title="SKILLS" text={skills} />
            <Section title="PROJECTS" text={projects} />
          </View>
        );
    }
  };

  return (
    <View style={[ styles.container, { backgroundColor: theme.bg }, ]} >
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          {headerTitle}
        </Text>
        <View style={{ width: 40 }} />
      </View>


      {/* Sub-header row: disclaimer + language toggle inline */}
      <View style={styles.subHeaderRow}>
        <Text style={[ styles.sectionSubtitle, { color: theme.textSecondary, flex: 1 }, ]} numberOfLines={2} >
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
                  {isValidForAI && !isModalField && (
                    <TouchableOpacity style={[ styles.aiButton, { borderColor: theme.accent }, ]} onPress={() => handleImproveWithAi(field)} disabled={loadingFieldKey === field.key} >
                      {loadingFieldKey === field.key ? (
                        <ActivityIndicator size="small" /> ) : (
                        <Text style={[ styles.aiButtonText, { color: theme.accent }, ]} >
                          ✨ Improve with AI
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

              <Text style={[ styles.helperText, { color: theme.textSecondary }, ]} >
                {field.placeholder}
              </Text>

              {!isModalField ? (
                <View style={{ position: "relative" }}> 
                  <TextInput style={[ styles.textInput, { color: theme.textPrimary, borderColor: theme.border, minHeight: field.multiline ? 90 : 40, }, ]}
                    multiline={!!field.multiline} value={field.value} onChangeText={(text) => updateFieldValue(field.key, text) } maxLength={isValidForAI ? AI_CHAR_LIMIT : undefined} textAlignVertical={field.multiline ? "top" : "center"} />

                  {isValidForAI && (
                    <Text style={{ position: "absolute", right: 10,  bottom: 20, color: "#9ca3af", fontSize: 12, }}> 
                      {field.value.length} / 20000
                    </Text>
                  )} 
                </View>
              ) : (
                <TouchableOpacity activeOpacity={0.9} onPress={() => openModal( field, fieldHasValue ? "edit" : "create" ) } style={[ styles.readOnlyBox, { borderColor: theme.border }, ]} >
                  <Text style={{ color: fieldHasValue ? theme.textPrimary : theme.textSecondary, fontSize: 13, }} >
                    {fieldHasValue ? field.value : "No details added yet. Tap to add more details."}
                  </Text>
                </TouchableOpacity>
              )}             

              {field.savedValue ? (
                <Text style={[ styles.savedHint, { color: theme.textSecondary }, ]} >
                  Last saved version is stored. Tap Cancel to restore it if needed.
                </Text>
              ) : null}
            </View>
          );
        })}
      </ScrollView>

      {/* Footer actions */}
      <View style={[ styles.footer, { backgroundColor: theme.bg }, ]} >
        <TouchableOpacity style={[ styles.footerButton, styles.previewButton, { borderColor: theme.border }, ]} onPress={() => setPreviewVisible(true)} >
          <Text style={[ styles.previewText, { color: theme.textPrimary }, ]} >
            Preview
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[ styles.footerButton, styles.saveButton, { backgroundColor: theme.accent }, ]} onPress={handleSaveDocument} disabled={savingDoc} >
          {savingDoc ? ( <ActivityIndicator /> ) : (
            <Text style={[ styles.saveText, { color: theme.textOnAccent }, ]} >
              Save to Documents
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Preview modal */}
      <Modal visible={previewVisible} animationType="slide" onRequestClose={() => setPreviewVisible(false)} >
        <View style={[ styles.previewContainer, { backgroundColor: theme.bg }, ]} >
          <View style={styles.previewHeader}>
            <TouchableOpacity onPress={() => setPreviewVisible(false)} >
              <Text style={[ styles.backText, { color: theme.textSecondary }, ]} >
                Close
              </Text>
            </TouchableOpacity>
            <Text style={[ styles.previewTitle, { color: theme.textPrimary }, ]} >
              Resume Preview
            </Text>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView style={styles.previewScroll} contentContainerStyle={{ padding: 16, paddingBottom: 32 }} >
            {renderPreviewContent()}
          </ScrollView>
        </View>
      </Modal>

      {/* Parametric modal (experience, education, etc.) */}
      <Modal visible={!!activeModalField} animationType="slide" onRequestClose={closeModal}>
        <View style={[ styles.previewContainer, { backgroundColor: theme.bg }, ]} >
          {(() => {
            const config = activeModalField ? MODAL_CONFIGS[activeModalField] : null;
            if (!config) return null;

            const isExperience = activeModalField === "experience";
            const isEducation = activeModalField === "education";
            const isContact = activeModalField === "contact";

            return (
              <>
                <View style={styles.previewHeader}>
                  {/* Cancel */ }
                  <TouchableOpacity onPress={closeModal}>
                    <Text style={[ styles.backText, { color: theme.textSecondary }, ]} >
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  {/* Title */ }
                  <Text style={[ styles.previewTitle, { color: theme.textPrimary }, ]} >
                    {config.title}{" "}
                    {modalMode === "edit" ? "(Edit)" : "(Add)"}
                  </Text>

                  {/* Save */ }
                  <TouchableOpacity onPress={handleModalSave}>
                    <Text style={[ styles.backText, { color: theme.accent, fontWeight: "600" }, ]} >
                      Save
                    </Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.previewScroll} contentContainerStyle={{ padding: 16, paddingBottom: 32, }} keyboardShouldPersistTaps="handled" >
                  {/* Primary 1 */}
                  {config.primary1Key && (
                    <>
                    <Text style={[ styles.fieldLabel, { color: theme.textPrimary, marginBottom: 4, }, ]} >
                      {config.primary1Label}
                    </Text>
                    <TextInput style={[ styles.textInput, { color: theme.textPrimary, borderColor: theme.border, }, ]} value={modalData[config.primary1Key]} 
                      placeholder={config.primary1Placeholder} placeholderTextColor={theme.textSecondary} 
                      onChangeText={(t) => setModalData((prev) => ({ ...prev, [config.primary1Key]: t, }))}/>
                    </>
                  )}

                  {/* Primary 2 */}
                  {config.primary2Key && (
                    <>
                    <Text style={[ styles.fieldLabel, { color: theme.textPrimary, marginBottom: 4, marginTop: 10, }, ]} >
                      {config.primary2Label}
                    </Text>
                    <TextInput style={[ styles.textInput, { color: theme.textPrimary, borderColor: theme.border, }, ]} value={modalData[config.primary2Key]}
                      placeholder={config.primary2Placeholder} placeholderTextColor={theme.textSecondary}
                      onChangeText={(t) => setModalData((prev) => ({ ...prev, [config.primary2Key]: t, })) }/>
                    </>
                  )}

                  {/* Primary 3 */}
                  {config.primary3Key && (
                    <>
                    <Text style={[ styles.fieldLabel, { color: theme.textPrimary, marginBottom: 4, marginTop: 10, }, ]} >
                      {config.primary3Label}
                    </Text>
                    <TextInput style={[ styles.textInput, { color: theme.textPrimary, borderColor: theme.border, }, ]} value={modalData[config.primary3Key]}
                      placeholder={config.primary3Placeholder} placeholderTextColor={theme.textSecondary}
                      onChangeText={(t) => setModalData((prev) => ({ ...prev, [config.primary3Key]: t, })) }/>
                    </>
                  )}

                  {/* Primary 4 */}
                  {config.primary4Key && (
                    <>
                    <Text style={[ styles.fieldLabel, { color: theme.textPrimary, marginBottom: 4, marginTop: 10, }, ]} >
                      {config.primary4Label}
                    </Text>
                    <TextInput style={[ styles.textInput, { color: theme.textPrimary, borderColor: theme.border, }, ]} value={modalData[config.primary4Key]}
                      placeholder={config.primary4Placeholder} placeholderTextColor={theme.textSecondary}
                      onChangeText={(t) => setModalData((prev) => ({ ...prev, [config.primary4Key]: t, })) }/>
                    </>
                  )}

                  {/* Primary 5 */}
                  {config.primary5Key && (
                    <>
                    <Text style={[ styles.fieldLabel, { color: theme.textPrimary, marginBottom: 4, marginTop: 10, }, ]} >
                      {config.primary5Label}
                    </Text>
                    <TextInput style={[ styles.textInput, { color: theme.textPrimary, borderColor: theme.border, }, ]} value={modalData[config.primary5Key]}
                      placeholder={config.primary5Placeholder} placeholderTextColor={theme.textSecondary}
                      onChangeText={(t) => setModalData((prev) => ({ ...prev, [config.primary5Key]: t, })) }/>
                    </>
                  )}

                  {/* Dates row */}
                  {config.supportsDates && (
                    <>
                    <View style={{ flexDirection: "row", marginTop: 10 }} >
                      <View style={{ flex: 1, marginRight: 6 }}>
                        <Text style={[ styles.fieldLabel, { color: theme.textPrimary, marginBottom: 4, }, ]} >
                          Start Date
                        </Text>
                        <TextInput style={[ styles.textInput, { color: theme.textPrimary, borderColor: theme.border, }, ]} value={modalData.startDate}
                          placeholder={config.primary2Placeholder} placeholderTextColor={theme.textSecondary}
                          onChangeText={(t) => setModalData((prev) => ({ ...prev, startDate: t, })) } />
                      </View>

                      <View style={{ flex: 1, marginLeft: 6 }}>
                        <Text style={[ styles.fieldLabel, { color: theme.textPrimary, marginBottom: 4, }, ]} >
                          End Date
                        </Text>
                        <TextInput
                          style={[ styles.textInput, { color: theme.textPrimary, borderColor: theme.border, }, config.supportsCurrent && modalData.isCurrent && { opacity: 0.4, }, ]}
                          editable={ !config.supportsCurrent || !modalData.isCurrent }
                          value={ config.supportsCurrent && modalData.isCurrent ? "Current" : modalData.endDate }
                          onChangeText={(t) => setModalData((prev) => ({ ...prev, endDate: t, })) }
                          placeholder="e.g., 11/2024"
                          placeholderTextColor={theme.textSecondary}
                        />
                      </View>
                    </View>
                    </>
                  )}

                  {/* Current toggle for experience */}
                  {config.supportsCurrent && (
                    <>
                    <TouchableOpacity style={[ styles.currentToggle, { borderColor: theme.border, backgroundColor: modalData.isCurrent ? "rgba(34,197,94,0.1)" : "transparent", }, ]}
                      onPress={toggleCurrent} >
                      <View style={[ styles.checkbox, { borderColor: theme.border, backgroundColor: modalData.isCurrent ? "#22c55e" : "transparent", }, ]} />
                      <Text style={[ styles.helperText, { color: theme.textSecondary }, ]} >
                        Currently ongoing
                      </Text>
                    </TouchableOpacity>
                    </>
                  )}

                  {/* Details + AI */}
                  {config.supportsAI && (
                    <>
                    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12, marginBottom: 4, }} >
                      <Text style={[ styles.fieldLabel, { color: theme.textPrimary }, ]} >
                        Details / Highlights
                      </Text>
                      <TouchableOpacity style={[ styles.aiButton, { borderColor: theme.accent, marginLeft: "auto", }, ]} onPress={() => handleModalAi(config)} disabled={loadingModalAi} >
                        {loadingModalAi ? (
                          <ActivityIndicator size="small" />) : (
                          <Text style={[ styles.aiButtonText, { color: theme.accent }, ]} >
                            ✨ Improve with AI
                          </Text>
                        )}
                      </TouchableOpacity>
                      </View>
                        <TextInput style={[ styles.textInput, { color: theme.textPrimary, borderColor: theme.border, minHeight: 120, }, ]}
                          multiline textAlignVertical="top" value={modalData.details}
                          onChangeText={(t) => setModalData((prev) => ({ ...prev, details: t, })) }
                          placeholder={
                            isExperience
                              ? "Describe your responsibilities and achievements.\nUse bullet-style lines. AI will help make them stronger."
                              : "Add key modules, thesis, honors or notable achievements. AI can polish this."
                          } placeholderTextColor={theme.textSecondary} />
                      </>
                  )}
                </ScrollView>
              </>
            );
          })()}
        </View>
      </Modal>
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
    
  },
  sectionSubtitle: {
    fontSize: 13,
    marginBottom: 16,
  },
  backText: { fontSize: 14 },
  headerTitle: { fontSize: 18, fontWeight: "600" },
  contextCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  contextTitle: { fontSize: 15, fontWeight: "600", marginBottom: 4 },
  contextSubtitle: { fontSize: 12 },
  chipRow: { flexDirection: "row", marginTop: 8 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: { fontSize: 11 },
  scroll: { flex: 1, paddingHorizontal: 16, marginTop: 8 },
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
  helperText: { fontSize: 11, marginTop: 4, marginBottom: 6 },
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    marginBottom: 6,
  },
  savedHint: { fontSize: 11 },
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
  previewTextContent: { fontSize: 14, lineHeight: 20 },
  subHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  // --- Preview base page ---
  pvPage: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.5)",
    padding: 14,
    backgroundColor: "#020617",
  },
  pvPageCreative: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.5)",
    flexDirection: "row",
    overflow: "hidden",
    backgroundColor: "#020617",
  },
  pvHeaderClassic: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148,163,184,0.4)",
    paddingBottom: 6,
  },
  pvHeaderTraditional: {
    marginBottom: 6,
  },
  pvHeaderBand: {
    backgroundColor: "#0f172a",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  pvHeaderClear: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  pvHeaderClearStripe: {
    width: 6,
    height: 40,
    borderRadius: 999,
    marginRight: 10,
    backgroundColor: "#38bdf8",
  },
  pvHeaderCreative: {
    marginBottom: 10,
  },
  pvName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#e5e7eb",
  },
  pvNameBand: {
    fontSize: 18,
    fontWeight: "700",
    color: "#e5e7eb",
  },
  pvHeadline: {
    fontSize: 13,
    color: "#9ca3af",
  },
  pvHeadlineBand: {
    fontSize: 13,
    color: "#cbd5f5",
  },
  pvHeadlineCreative: {
    fontSize: 13,
    color: "#fbbf24",
  },

  pvSeparator: {
    height: 1,
    backgroundColor: "rgba(148,163,184,0.6)",
    marginVertical: 8,
  },
  pvSeparatorThin: {
    height: 1,
    backgroundColor: "rgba(51,65,85,0.8)",
    marginVertical: 4,
  },

  // Sections
  pvSection: {
    marginTop: 8,
  },
  pvSectionCompact: {
    marginTop: 6,
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

  // Two-column
  pvTwoCol: {
    flexDirection: "row",
    marginTop: 4,
  },
  pvMainCol: {
    flex: 1.4,
    paddingRight: 8,
  },
  pvSideCol: {
    flex: 0.9,
    paddingLeft: 8,
  },
  pvSideColBoxed: {
    flex: 0.9,
    paddingLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: "rgba(51,65,85,0.8)",
  },

  // Creative layout
  pvCreativeLeftBar: {
    width: 10,
    backgroundColor: "#f97316",
  },
  pvCreativeContent: {
    flex: 1,
    padding: 12,
  },

  // Experience modal extras
  currentToggle: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    marginRight: 8,
  },

  // Language Toggle
  languageToggleWrapper: {
    flexDirection: "row",
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#1f2937",
    marginBottom: 16,
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

  pvContactBlock: {
    marginTop: 4,
  },
  pvContactText: {
    fontSize: 11,
    color: "#9ca3af",
  },

  // Skill chips
  pvChipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  pvChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.7)",
    marginRight: 6,
    marginBottom: 6,
  },
  pvChipText: {
    fontSize: 11,
    color: "#e5e7eb",
  },

  // Sidebar cards
  pvSideCard: {
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(51,65,85,0.9)",
    marginBottom: 8,
  },
  pvSideCardBoxed: {
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(51,65,85,0.9)",
    marginBottom: 8,
    backgroundColor: "rgba(15,23,42,0.9)",
  },

});
