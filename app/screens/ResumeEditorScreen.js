// app/screens/ResumeEditorScreen.js
import React, { useContext, useMemo, useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, TouchableWithoutFeedback, Alert, Modal, Platform, Dimensions } from "react-native";
import { AppContext, saveDocument } from "../context/AppContext";
import { improveAboutMe, improveSkillsSection, improveProjectsSection, improveExpertiseSection, improvePublishesSection, improveExperienceDetails, improveEducationDetails } from "../utils/api";
import DateTimePicker from "@react-native-community/datetimepicker";

const AI_CHAR_LIMIT = 20000;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

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
  // Experience
  company: "",
  title: "",

  // Education
  institution: "",
  degree: "",

  // Dates
  startDate: "",
  endDate: "",
  isCurrent: false,

  // Contact
  email: "",
  mobile: "",
  address: "",
  website: "",
  linkedin: "",

  // Certificates
  certName: "",
  issuer: "",
  url: "",

  // Referrals
  refName: "",
  refCompany: "",
  contact: "",

  // Common free-text details
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

      lines.forEach((line) => {
        const lower = line.toLowerCase();

        if (lower.startsWith("email:")) {
          data.email = line.split(":").slice(1).join(":").trim();
        } else if (lower.startsWith("phone:") || lower.startsWith("mobile:")) {
          data.mobile = line.split(":").slice(1).join(":").trim();
        } else if (lower.startsWith("address:")) {
          data.address = line.split(":").slice(1).join(":").trim();
        } else if (lower.startsWith("website:")) {
          data.website = line.split(":").slice(1).join(":").trim();
        } else if (lower.startsWith("linkedin:")) {
          data.linkedin = line.split(":").slice(1).join(":").trim();
        }
      });

      return data;
    },

    format: (data, previousValue, mode) => {
      const { email, mobile, address, website, linkedin } = data;

      const lines = [];
      if (email) lines.push(`Email: ${email}`);
      if (mobile) lines.push(`Phone: ${mobile}`);
      if (address) lines.push(`Address: ${address}`);
      if (website) lines.push(`Website: ${website}`);
      if (linkedin) lines.push(`LinkedIn: ${linkedin}`);

      const block = lines.join("\n");
      return block;
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

      lines.forEach((line) => {
        const lower = line.toLowerCase();

        if (lower.startsWith("certName:")) {
          data.certName = line.split(":").slice(1).join(":").trim();
        } else if (lower.startsWith("issuer:")) {
          data.issuer = line.split(":").slice(1).join(":").trim();
        } else if (lower.startsWith("url:")) {
          data.url = line.split(":").slice(1).join(":").trim();
        }
      });

      return data;
    },
    format: (data, previousValue, mode) => {
      const { certName, issuer, url } = data;
      const lines = [];
      if (certName) lines.push(`Certificate Name: ${certName}`);
      if (issuer) lines.push(`Issued by: ${issuer}`);
      if (url) lines.push(`Confirm: ${url}`);

      const block = lines.join("\n");
      return block;
    },
  },

  referrals: {
    title: "Referrals",
    aiSectionKey: "referrals",
    primary1Label: "Referral Name",
    primary1Key: "refName",
    primary1Placeholder: "",
    primary2Label: "Company",
    primary2Key: "refCompany",
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

      lines.forEach((line) => {
        const lower = line.toLowerCase();

        if (lower.startsWith("refName:")) {
          data.refName = line.split(":").slice(1).join(":").trim();
        } else if (lower.startsWith("refCompany:")) {
          data.refCompany = line.split(":").slice(1).join(":").trim();
        } else if (lower.startsWith("contact:")) {
          data.contact = line.split(":").slice(1).join(":").trim();
        }
      });

      return data;
    },
    format: (data, previousValue, mode) => {
      const { refName, refCompany, contact } = data;
      const lines = [];
      if (refName) lines.push(`Reference Name: ${refName}`);
      if (refCompany) lines.push(`Company: ${refCompany}`);
      if (contact) lines.push(`Contact Info: ${contact}`);

      const block = lines.join("\n");
      return block;
    },
  },
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
  experience_details: improveExperienceDetails,
  education_details: improveEducationDetails,
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

  // 🔹 Date picker state
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [datePickerTarget, setDatePickerTarget] = useState(null); // "startDate" | "endDate"
  const [datePickerValue, setDatePickerValue] = useState(new Date());

  const formatDateLabel = (raw) => {
    if (!raw) return "";
    const d = new Date(raw);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString(); // uses device locale – "standard"
    }
    return raw;
  };

  const openDatePicker = (targetKey) => {
    setDatePickerTarget(targetKey);

    // if we already have a date string → try to parse it
    const raw = modalData[targetKey];
    let initial = new Date();
    if (raw) {
      const parsed = new Date(raw);
      if (!isNaN(parsed.getTime())) {
        initial = parsed;
      }
    }
    setDatePickerValue(initial);
    setDatePickerVisible(true);
  };

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setDatePickerValue(selectedDate);
    }
  };

  const handleDateSave = () => {
    if (!datePickerTarget) {
      setDatePickerVisible(false);
      return;
    }

    const iso = datePickerValue.toISOString().split("T")[0]; // "YYYY-MM-DD"

    setModalData((prev) => ({
      ...prev,
      [datePickerTarget]: iso,
    }));

    setDatePickerVisible(false);
    setDatePickerTarget(null);
  };

  const handleDateCancel = () => {
    setDatePickerVisible(false);
    setDatePickerTarget(null);
  };

  const parseISODate = (str) => {
    if (!str) return null;
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  };

  const compareDates = (a, b) => {
    // returns -1 if a<b, 0 if equal, 1 if a>b
    const da = parseISODate(a);
    const db = parseISODate(b);
    if (!da || !db) return 0;
    if (da.getTime() < db.getTime()) return -1;
    if (da.getTime() > db.getTime()) return 1;
    return 0;
  };

  const validateModalDates = (config, modalData, isTurkish) => {
    const { supportsDates, supportsCurrent } = config || {};
    if (!supportsDates) return { ok: true };

    const { startDate, endDate, isCurrent } = modalData || {};

    // Experience: if "current", require start date
    if (supportsCurrent && isCurrent) {
      if (!startDate) {
        return {
          ok: false,
          message: isTurkish
            ? "Devam eden bir pozisyon için başlangıç tarihi zorunludur."
            : "Start date is required for a current position.",
        };
      }
      // endDate is ignored / forced to blank in your toggle; nothing else to check
      return { ok: true };
    }

    // If only one of them is set, that's OK (e.g., just graduation year)
    if (!startDate || !endDate) {
      return { ok: true };
    }

    const cmp = compareDates(startDate, endDate);
    if (cmp === 1) {
      // start > end
      return {
        ok: false,
        message: isTurkish
          ? "Bitiş tarihi, başlangıç tarihinden önce olamaz."
          : "End date cannot be earlier than start date.",
      };
    }

    return { ok: true };
  };

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

  const handleModalSave = () => {
    if (!activeModalField) return;
    const config = MODAL_CONFIGS[activeModalField];
    if (!config) {
      closeModal();
      return;
    }

    const validation = validateModalDates(config, modalData, isTurkish);
    if (!validation.ok) {
      Alert.alert( isTurkish ? "Geçersiz tarih" : "Invalid date", validation.message );
      return;
    }

    const prevValue = fields.find((f) => f.key === activeModalField)?.value || "";
    const formatted = config.format(modalData, prevValue, modalMode);

    updateFieldValue(activeModalField, formatted);
    closeModal();
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
      const parsed = config.parse ? config.parse(field.value) : { ...DEFAULT_MODAL_DATA, details: field.value };
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
                    <TouchableOpacity style={[ styles.smallIconButton, { borderColor: theme.border }, ]} onPress={() => openModal(field, fieldHasValue ? "edit" : "create")} >
                      <Text style={[ styles.smallIconButtonText, { color: theme.textPrimary }, ]} > ✎ </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {field.placeholder ? (
                <Text style={[ styles.helperText, { color: theme.textSecondary }, ]} >
                  {field.placeholder}
                </Text>
              ) : null}

              <View style={{ position: "relative" }}>
                <TextInput style={[ styles.textInput, { color: theme.textPrimary, borderColor: theme.border, minHeight: isMultiline ? 80 : 40, backgroundColor: theme.bg, }, ]}
                  multiline={isMultiline} value={field.value} onChangeText={(text) => updateFieldValue(field.key, text) } maxLength={isValidForAI ? AI_CHAR_LIMIT : undefined} textAlignVertical={isMultiline ? "top" : "center"} />

                {isValidForAI && (
                  <Text style={styles.charCounter}>
                    {field.value?.length || 0} / {AI_CHAR_LIMIT}
                  </Text>
                )}
              </View>
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

      {/* Parametric modal (experience, education, etc.) */}
      <Modal visible={!!activeModalField} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={[ styles.storyModalOverlay, ]} >
          {/* Invisible full-screen click area for background tap */}
          <TouchableWithoutFeedback onPress={closeModal}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>

          {/* Actual popup card – NOT inside the background touchable */}
          <View style={styles.modalCard}>
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
                      <View style={{ flexDirection: "row", marginTop: 10 }}>
                        {/* Start Date */}
                        <View style={{ flex: 1, marginRight: 6 }}>
                          <Text style={[ styles.fieldLabel, { color: theme.textPrimary, marginBottom: 4 }, ]} >
                            Start Date
                          </Text>
                          <TouchableOpacity style={[ styles.textInput, { justifyContent: "center", borderColor: theme.border, backgroundColor: theme.bg, }, ]} onPress={() => openDatePicker("startDate")} >
                            <Text style={{ color: modalData.startDate ? theme.textPrimary : theme.textSecondary, fontSize: 13, }} >
                              {modalData.startDate ? formatDateLabel(modalData.startDate) : language === "tr" ? "Başlangıç tarihi seç" : "Select start date"}
                            </Text>
                          </TouchableOpacity>
                        </View>

                        {/* End Date */}
                        <View style={{ flex: 1, marginLeft: 6 }}>
                          <Text style={[ styles.fieldLabel, { color: theme.textPrimary, marginBottom: 4 }, ]} >
                            End Date
                          </Text>
                          <TouchableOpacity style={[ styles.textInput, { justifyContent: "center", borderColor: theme.border, backgroundColor: theme.bg, ...(config.supportsCurrent && modalData.isCurrent && { opacity: 0.4 }), }, ]} 
                            disabled={config.supportsCurrent && modalData.isCurrent} onPress={() => !(config.supportsCurrent && modalData.isCurrent) && openDatePicker("endDate") } >
                            <Text style={{ color: config.supportsCurrent && modalData.isCurrent ? theme.textSecondary : modalData.endDate ? theme.textPrimary : theme.textSecondary, fontSize: 13, }} >
                              {config.supportsCurrent && modalData.isCurrent ? "Current" : modalData.endDate ? formatDateLabel(modalData.endDate) : language === "tr" ? "Bitiş tarihi seç" : "Select end date"}
                            </Text>
                          </TouchableOpacity>
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
        </View>
        {/* {datePickerVisible && ( <DateTimePicker value={datePickerValue} mode="date" display={Platform.OS === "ios" ? "spinner" : "default"} onChange={handleDateChange} /> )} */}

        {/* Date Picker */}
        {datePickerVisible && (
          <View style={styles.datePickerOverlay}>
            <View style={[styles.datePickerCard, { backgroundColor: theme.bgCard }]}>
              {/* Header with Cancel / Save */}
              <View style={styles.datePickerHeader}>
                <TouchableOpacity onPress={handleDateCancel}>
                  <Text style={[styles.backText, { color: theme.textSecondary }]}>
                    {language === "tr" ? "İptal" : "Cancel"}
                  </Text>
                </TouchableOpacity>

                <Text
                  style={[
                    styles.previewTitle,
                    { color: theme.textPrimary, fontSize: 16 },
                  ]}
                >
                  {datePickerTarget === "startDate"
                    ? language === "tr"
                      ? "Başlangıç Tarihi"
                      : "Start Date"
                    : language === "tr"
                    ? "Bitiş Tarihi"
                    : "End Date"}
                </Text>

                <TouchableOpacity onPress={handleDateSave}>
                  <Text
                    style={[
                      styles.backText,
                      { color: theme.accent, fontWeight: "600" },
                    ]}
                  >
                    {language === "tr" ? "Kaydet" : "Save"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Actual picker */}
              <DateTimePicker
                value={datePickerValue}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "calendar"}
                onChange={handleDateChange}
              />
            </View>
          </View>
        )}
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
    marginBottom: 5,
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
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "86%",
    backgroundColor: "#12141c",
    borderRadius: 16,
    padding: 16,
    height: SCREEN_HEIGHT * 0.55,
  },
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
  // date picker
  datePickerOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  datePickerCard: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: Platform.OS === "ios" ? 24 : 12,
    paddingTop: 8,
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 4,
  },

  // Story modal
  storyModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.63)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  storyModalCategory: {
    fontSize: 13,
    color: "#ffdd88",
    marginBottom: 4,
  },
  storyModalTitle: {
    fontSize: 20,
    color: "#ffffff",
    fontWeight: "700",
    marginBottom: 4,
  },
  storyModalCardBackground: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.55,
    borderRadius: 20,
    overflow: "hidden", // must-have!
  },
  storyModalCardImage: {
    borderRadius: 20,
  },
  storyModalCardInner: {
    flex: 1,
    padding: 25,
    backgroundColor: "rgba(10, 10, 15, 0.34)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  storyModalText: {
    fontSize: 15,
    color: "#e5e5f0",
    lineHeight: 22,
  },
  storyModalTopContent: {
    flex: 1,
  },
  storyModalButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.25)",
  },
  storyModalButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
  },
  storyModalButtonText: {
    fontSize: 14,
    color: "#ffffff",
  },
  storyModalFooterNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  storyLeftZone: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "25%",          // first quarter of the modal
    zIndex: 20,
  },
  storyRightZone: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "25%",          // last quarter of the modal
    zIndex: 20,
  },
});
