// app/screens/ResumeEditorScreen.js
import React, { useContext, useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { AppContext, saveDocument } from "../context/AppContext";
import {
  improveAboutMe,
  improveSkillsSection,
  improveProjectsSection,
  improveExpertiseSection,
  improvePublishesSection,
} from "../utils/api";

const AI_CHAR_LIMIT = 20000;

// Default order / base metadata for fields we care about
const BASE_FIELD_CONFIG = [
  { key: "name", label: "Full Name", isForAi: false },
  {
    key: "headline",
    label: "Job Title / Headline",
    placeholder: "e.g., Senior Account Executive",
    isForAi: false,
  },
  {
    key: "aboutMe",
    label: "About Me",
    placeholder:
      "Short professional summary or profile section at the top of your resume.",
    isForAi: true,
    multiline: true,
  },
  {
    key: "contact",
    label: "Contact Info",
    placeholder: "Email, phone, LinkedIn, location, portfolio, etc.",
    isForAi: false,
    multiline: true,
  },
  {
    key: "experience",
    label: "Work Experience",
    placeholder:
      "Roles, companies, dates and bullet points describing your responsibilities & impact.",
    isForAi: false,
    multiline: true,
  },
  {
    key: "education",
    label: "Education",
    placeholder:
      "Degrees, institutions, graduation years, key coursework or achievements.",
    isForAi: false,
    multiline: true,
  },
  {
    key: "skills",
    label: "Skills",
    placeholder:
      "Hard skills, tools, technologies and languages. You can separate with commas or bullets.",
    isForAi: true,
    multiline: true,
  },
  {
    key: "projects",
    label: "Projects",
    placeholder:
      "Key projects, portfolio items, open source, side products – especially useful for creative/tech roles.",
    isForAi: true,
    multiline: true,
  },
  {
    key: "languages",
    label: "Languages",
    placeholder: "Spoken languages for business communication.",
    isForAi: false,
    multiline: true,
  },
  {
    key: "expertise",
    label: "Expertise",
    placeholder:
      "Areas of expertise where you feel confident (e.g., Enterprise Salesforce Architecture).",
    isForAi: true,
    multiline: true,
  },
  {
    key: "certificates",
    label: "Certificates",
    placeholder:
      "Official certificates you hold to display your experience / knowledge in a particular area.",
    isForAi: false,
    multiline: true,
  },
  {
    key: "publishes",
    label: "Published Works / Rewards",
    placeholder:
      "Any kind of reward you received or any published, acclaimed work.",
    isForAi: true,
    multiline: true,
  },
  {
    key: "referrals",
    label: "Referrals",
    placeholder:
      "Referrals from a previous work place or a relevant person to endorse your skills / experience.",
    isForAi: false,
    multiline: true,
  },
];

const AI_API_BY_FIELD = {
  aboutMe: improveAboutMe,
  skills: improveSkillsSection,
  projects: improveProjectsSection,
  expertise: improveExpertiseSection,
  publishes: improvePublishesSection,
};

export default function ResumeEditorScreen({ route, navigation }) {
  const {
    theme,
    isPro,
    freeCreditsLeft,
    consumeCredit,
    language,
    setLanguage,
  } = useContext(AppContext);

  const { mode, initialTitle, initialSections, sourceFileName, meta } =
    route.params || {};

  const [docTitle, setDocTitle] = useState(
    initialTitle || "Imported Resume"
  );
  const [fields, setFields] = useState([]);
  const [loadingFieldKey, setLoadingFieldKey] = useState(null);
  const [savingDoc, setSavingDoc] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);

  const isTurkish = language === "tr";
  const disclaimer = isTurkish
    ? "*AI tarafından üretilmiştir. Başvurmadan önce lütfen gözden geçirin."
    : "*AI-generated. Please review before using in applications.";

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

    const baseMapped = BASE_FIELD_CONFIG.map((cfg) => ({
      ...cfg,
      value: sectionMap[cfg.key] || "",
      savedValue: "",
    }));

    // Include any unknown sections returned by backend as extra fields
    const knownKeys = new Set(BASE_FIELD_CONFIG.map((c) => c.key));
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
    setFields((prev) =>
      prev.map((f) => (f.key === key ? { ...f, value: text } : f))
    );
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
      const content = buildPreviewText();

      await saveDocument({
        title: docTitle || "Imported Resume",
        type: "resume",
        content,
      });

      Alert.alert(
        isTurkish ? "Kaydedildi" : "Saved",
        isTurkish
          ? "CV'in My Documents bölümüne kaydedildi."
          : "Your resume has been saved to My Documents."
      );
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

  // ---------- Preview UI ----------
  const renderPreviewContent = () => {
    const {
      name,
      headline,
      aboutMe,
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

    const Section = ({ title, text }) => {
      if (!text?.trim()) return null;
      return (
        <View style={styles.pvSection}>
          <Text style={styles.pvSectionTitle}>{title}</Text>
          <Text style={styles.pvSectionBody}>{text.trim()}</Text>
        </View>
      );
    };

    const toChips = (text = "") =>
      text
        .split(/[,;•\n]+/g)
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 16);

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

    // Keep preview similar to TemplateEditor "classic" style
    return (
      <View style={styles.pvPage}>
        <View style={styles.pvHeaderClassic}>
          <Text style={styles.pvName}>{mainName}</Text>
          <Text style={styles.pvHeadline}>{mainHeadline}</Text>
          {renderContact()}
        </View>

        <Section
          title={isTurkish ? "PROFİL" : "PROFILE"}
          text={aboutMe}
        />
        <Section
          title={isTurkish ? "DENEYİM" : "EXPERIENCE"}
          text={experience}
        />
        <Section
          title={isTurkish ? "EĞİTİM" : "EDUCATION"}
          text={education}
        />

        {skills?.trim() ? (
          <View style={styles.pvSection}>
            <Text style={styles.pvSectionTitle}>
              {isTurkish ? "YETENEKLER" : "SKILLS"}
            </Text>
            {renderSkillChips(skills)}
          </View>
        ) : null}

        <Section
          title={isTurkish ? "PROJELER" : "PROJECTS"}
          text={projects}
        />
        <Section
          title={isTurkish ? "DİLLER" : "LANGUAGES"}
          text={languages}
        />
        <Section
          title={isTurkish ? "UZMANLIK ALANLARI" : "AREAS OF EXPERTISE"}
          text={expertise}
        />
        <Section
          title={isTurkish ? "SERTİFİKALAR" : "CERTIFICATES"}
          text={certificates}
        />
        <Section
          title={isTurkish ? "YAYINLAR & ÖDÜLLER" : "PUBLICATIONS & AWARDS"}
          text={publishes}
        />
        <Section
          title={isTurkish ? "REFERANSLAR" : "REFERRALS"}
          text={referrals}
        />
      </View>
    );
  };

  const headerTitle =
    mode === "upload"
      ? isTurkish
        ? "Yüklenen CV Editörü"
        : "Uploaded Resume Editor"
      : isTurkish
      ? "CV Editörü"
      : "Resume Editor";

  // ---------- Render ----------
  return (
    <View
      style={[styles.container, { backgroundColor: theme.bg }]}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text
            style={[styles.backText, { color: theme.textSecondary }]}
          >
            {isTurkish ? "Geri" : "Back"}
          </Text>
        </TouchableOpacity>

        <Text
          style={[styles.headerTitle, { color: theme.textPrimary }]}
        >
          {headerTitle}
        </Text>

        <View style={{ width: 40 }} />
      </View>

      {/* Title input + file/meta pill */}
      <View style={styles.titleRow}>
        <TextInput
          style={[
            styles.titleInput,
            {
              color: theme.textPrimary,
              borderColor: theme.border,
              backgroundColor: theme.bgCard,
            },
          ]}
          value={docTitle}
          onChangeText={setDocTitle}
          placeholder={
            isTurkish ? "Belge başlığı" : "Document title (optional)"
          }
          placeholderTextColor={theme.textSecondary}
        />

        {(sourceFileName || meta) && (
          <View
            style={[
              styles.metaPill,
              {
                borderColor: theme.border,
                backgroundColor: theme.bgCard,
              },
            ]}
          >
            <Text
              style={[
                styles.metaPillText,
                { color: theme.textSecondary },
              ]}
              numberOfLines={1}
            >
              {sourceFileName || "Imported file"}
              {meta?.pageCount ? ` • ${meta.pageCount} pages` : ""}
              {meta?.wordCount ? ` • ${meta.wordCount} words` : ""}
            </Text>
          </View>
        )}
      </View>

      {/* Sub-header: disclaimer + language toggle */}
      <View style={styles.subHeaderRow}>
        <Text
          style={[
            styles.subtitle,
            { color: theme.textSecondary, flex: 1 },
          ]}
          numberOfLines={2}
        >
          {disclaimer}
        </Text>

        <View style={styles.languageToggleWrapper}>
          <TouchableOpacity
            style={[
              styles.languageButton,
              isTurkish && styles.languageButtonActive,
            ]}
            onPress={() => setLanguage("tr")}
          >
            <Text
              style={[
                styles.languageButtonText,
                isTurkish && styles.languageButtonTextActive,
              ]}
            >
              TR
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.languageButton,
              !isTurkish && styles.languageButtonActive,
            ]}
            onPress={() => setLanguage("en")}
          >
            <Text
              style={[
                styles.languageButtonText,
                !isTurkish && styles.languageButtonTextActive,
              ]}
            >
              EN
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Fields */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        {fields.map((field) => {
          const isValidForAI = field.isForAi;
          const isMultiline = !!field.multiline;

          return (
            <View
              key={field.key}
              style={[
                styles.fieldCard,
                {
                  backgroundColor: theme.bgCard,
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={styles.fieldHeader}>
                <Text
                  style={[
                    styles.fieldLabel,
                    { color: theme.textPrimary },
                  ]}
                >
                  {field.label}
                </Text>

                {isValidForAI && (
                  <TouchableOpacity
                    style={[
                      styles.aiButton,
                      { borderColor: theme.accent },
                    ]}
                    onPress={() => handleImproveWithAi(field)}
                    disabled={loadingFieldKey === field.key}
                  >
                    {loadingFieldKey === field.key ? (
                      <ActivityIndicator size="small" />
                    ) : (
                      <Text
                        style={[
                          styles.aiButtonText,
                          { color: theme.accent },
                        ]}
                      >
                        ✨{" "}
                        {isTurkish
                          ? "AI ile iyileştir"
                          : "Improve with AI"}
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>

              {field.placeholder ? (
                <Text
                  style={[
                    styles.helperText,
                    { color: theme.textSecondary },
                  ]}
                >
                  {field.placeholder}
                </Text>
              ) : null}

              <View style={{ position: "relative" }}>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      color: theme.textPrimary,
                      borderColor: theme.border,
                      minHeight: isMultiline ? 80 : 40,
                      backgroundColor: theme.bg,
                    },
                  ]}
                  multiline={isMultiline}
                  value={field.value}
                  onChangeText={(text) =>
                    updateFieldValue(field.key, text)
                  }
                  maxLength={isValidForAI ? AI_CHAR_LIMIT : undefined}
                  textAlignVertical={isMultiline ? "top" : "center"}
                  placeholderTextColor={theme.textSecondary}
                />

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
      <View
        style={[
          styles.footer,
          { backgroundColor: theme.bg },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.footerButton,
            styles.previewButton,
            { borderColor: theme.border },
          ]}
          onPress={() => setPreviewVisible(true)}
        >
          <Text
            style={[
              styles.previewText,
              { color: theme.textPrimary },
            ]}
          >
            {isTurkish ? "Önizleme" : "Preview"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.footerButton,
            styles.saveButton,
            { backgroundColor: theme.accent },
          ]}
          onPress={handleSaveDocument}
          disabled={savingDoc}
        >
          {savingDoc ? (
            <ActivityIndicator color={theme.textOnAccent} />
          ) : (
            <Text
              style={[
                styles.saveText,
                { color: theme.textOnAccent },
              ]}
            >
              {isTurkish
                ? "My Documents'a kaydet"
                : "Save to Documents"}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Preview modal */}
      <Modal
        visible={previewVisible}
        animationType="slide"
        onRequestClose={() => setPreviewVisible(false)}
      >
        <View
          style={[
            styles.previewContainer,
            { backgroundColor: theme.bg },
          ]}
        >
          <View style={styles.previewHeader}>
            <TouchableOpacity
              onPress={() => setPreviewVisible(false)}
            >
              <Text
                style={[
                  styles.backText,
                  { color: theme.textSecondary },
                ]}
              >
                {isTurkish ? "Kapat" : "Close"}
              </Text>
            </TouchableOpacity>
            <Text
              style={[
                styles.previewTitle,
                { color: theme.textPrimary },
              ]}
            >
              {isTurkish ? "CV Önizleme" : "Resume Preview"}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            style={styles.previewScroll}
            contentContainerStyle={{
              padding: 16,
              paddingBottom: 32,
            }}
          >
            {renderPreviewContent()}
          </ScrollView>
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
