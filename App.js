import React, {
  useState,
  useCallback,
  useContext,
  useEffect,
} from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
} from "react-native";
import {
  NavigationContainer,
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { optimizeResume, jobMatchResume, generateCoverLetter, getInterviewFeedback, getInterviewQuestions } from "./app/utils/api";
import Purchases from "react-native-purchases";
import { buildResumeHtml } from "./app/utils/templates"; 

const Stack = createNativeStackNavigator();

// ---------- AsyncStorage helpers ----------
const DOCUMENTS_KEY = "ai_resume_documents_v1";

async function addDocument(doc) {
  try {
    const existing = await AsyncStorage.getItem(DOCUMENTS_KEY);
    const list = existing ? JSON.parse(existing) : [];
    list.unshift(doc);
    await AsyncStorage.setItem(DOCUMENTS_KEY, JSON.stringify(list));
  } catch (e) {
    console.log("Save doc error:", e);
    throw e;
  }
}

async function getDocuments() {
  try {
    const existing = await AsyncStorage.getItem(DOCUMENTS_KEY);
    return existing ? JSON.parse(existing) : [];
  } catch (e) {
    console.log("Load docs error:", e);
    return [];
  }
}

async function removeDocument(id) {
  try {
    const existing = await AsyncStorage.getItem(DOCUMENTS_KEY);
    const list = existing ? JSON.parse(existing) : [];
    const updated = list.filter((d) => d.id !== id);
    await AsyncStorage.setItem(DOCUMENTS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.log("Delete doc error:", e);
    throw e;
  }
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

// Small "PRO" badge for headers
function ProBadge() {
  const { isPro, theme } = useContext(AppContext);
  if (!isPro) return null;

  return (
    <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: theme.accent, }} >
      <Text style={{ color: theme.textOnAccent, fontSize: 12, fontWeight: "700", }} >
        PRO
      </Text>
    </View>
  );
}

// Small "Lock Icon" for free users
function LockIcon({ color = "#9ca3af", size = 14, style }) {
  return (
    <Text style={[ { fontSize: size, color, marginLeft: 6, }, style, ]}  >
      🔒
    </Text>
  );
}

// Banner that shows free credits vs Pro unlimited
function UsageBanner({ style }) {
  const { isPro, freeCreditsLeft, theme } = useContext(AppContext);

  if (isPro) {
    return (
      <Text
        style={[
          styles.sectionSubtitle,
          {
            color: theme.textSecondary,
            marginTop: 4,
            marginBottom: 8,
          },
          style,
        ]}
      >
        ✅ You are on <Text style={{ fontWeight: "600" }}>ResumeIQ Pro</Text>.  
        Unlimited AI calls for resume, job match and interview coaching.
      </Text>
    );
  }

  return (
    <Text
      style={[
        styles.sectionSubtitle,
        {
          color: theme.textSecondary,
          marginTop: 4,
          marginBottom: 8,
        },
        style,
      ]}
    >
      Free plan:{" "}
      <Text style={{ fontWeight: "600" }}>
        {freeCreditsLeft} AI credits
      </Text>{" "}
      left today. Upgrade to Pro for unlimited usage.
    </Text>
  );
}

// ---------- App Context & Theme ----------
const AppContext = React.createContext(null);

const lightTheme = {
  mode: "light",
  bg: "#f9fafb",
  bgCard: "#ffffff",
  border: "#e5e7eb",
  textPrimary: "#111827",
  textSecondary: "#4b5563",
  accent: "#38bdf8",
  textOnAccent: "#0f172a",
};

const darkTheme = {
  mode: "dark",
  bg: "#020617",
  bgCard: "#0b1220",
  border: "#1f2937",
  textPrimary: "#e5e7eb",
  textSecondary: "#9ca3af",
  accent: "#38bdf8",
  textOnAccent: "#0f172a",
};

function ProOnlyFeatureTile({ title, subtitle, onPress }) {
  const { isPro, theme } = useContext(AppContext);
  const navigation = useNavigation();
  const locked = !isPro;

  const handlePress = () => {
    if (locked) {
      // Redirect non-Pro users to Upgrade screen
      navigation.navigate("Upgrade");
    } else if (onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={[
        styles.resultBox,
        {
          backgroundColor: theme.bgCard,
          borderColor: theme.border,
          opacity: locked ? 0.7 : 1,
        },
      ]}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 4,
        }}
      >
        <Text
          style={[
            styles.resultTitle,
            { color: theme.textPrimary },
          ]}
        >
          {title}
        </Text>
        {locked && <LockIcon color={theme.textSecondary} />}
      </View>

      <Text
        style={[
          styles.resultText,
          { color: theme.textSecondary },
        ]}
      >
        {subtitle}
      </Text>

      {locked && (
        <Text
          style={{
            marginTop: 8,
            fontSize: 12,
            color: theme.textSecondary,
          }}
        >
          Pro only feature – tap to upgrade.
        </Text>
      )}
    </TouchableOpacity>
  );
}

// ---------- Welcome ----------
function WelcomeScreen({ navigation }) {
  const { theme } = useContext(AppContext);

  return (
    <View
      style={[
        styles.welcomeContainer,
        { backgroundColor: theme.bg },
      ]}
    >
      <Text
        style={[
          styles.appTitle,
          { color: theme.textPrimary },
        ]}
      >
        AI Resume & Interview Coach
      </Text>
      <Text
        style={[
          styles.appSubtitle,
          { color: theme.textSecondary },
        ]}
      >
        Optimize your CV, match job descriptions and practice interviews
        with AI.
      </Text>

      <TouchableOpacity
        style={[
          styles.primaryButton,
          { backgroundColor: theme.accent },
        ]}
        onPress={() => navigation.replace("Home")}
      >
        <Text
          style={[
            styles.primaryButtonText,
            { color: theme.textOnAccent },
          ]}
        >
          Continue
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ---------- Home ----------
function HomeScreen({ navigation }) {
  const { theme, isPro, freeCreditsLeft } = useContext(AppContext);

  return (
    <View
      style={[
        styles.homeContainer,
        { backgroundColor: theme.bg },
      ]}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={styles.homeTitle}>ResumeIQ</Text>
        <ProBadge />
      </View>
      <Text
        style={[
          styles.homeTitle,
          { color: theme.textPrimary },
        ]}
      >
        What do you want to work on?
      </Text>
      <Text
        style={[
          styles.homeSubtitle,
          { color: theme.textSecondary },
        ]}
      >
        Pick a tool and I’ll help you step by step.
      </Text>

      {!isPro && (
        <Text
          style={[
            styles.sectionSubtitle,
            { color: theme.textSecondary },
          ]}
        >
          Free credits left: {freeCreditsLeft}
        </Text>
      )}

      <ScrollView
        contentContainerStyle={styles.cardList}
        showsVerticalScrollIndicator={false}
      >
        <FeatureCard
          title="Optimize My Resume"
          description="Rewrite and improve your CV for maximum impact."
          emoji="📄"
          onPress={() => navigation.navigate("OptimizeResume")}
        />

        <FeatureCard
          title="Match to Job Description"
          description="Tailor your resume & cover letter for a specific role."
          emoji="🎯"
          onPress={() => navigation.navigate("JobMatch")}
        />

        <FeatureCard
          title="Interview Coach"
          description="Practice questions and get instant feedback."
          emoji="🎤"
          onPress={() => navigation.navigate("InterviewCoach")}
        />

        <ProOnlyFeatureTile
          title="Salary Benchmarks"
          subtitle="Coming soon: Pro-only salary insights for your target role."
          onPress={() => {
            // For now, maybe still send to Upgrade or show a toast
            navigation.navigate("Upgrade");
          }}
        />

        <ProOnlyFeatureTile
          title="Advanced Templates"
          subtitle="Export ATS-ready resumes with different layouts and tones."
          onPress={() => navigation.navigate("AdvancedTemplates")} // future screen
        />

        <FeatureCard
          title="My Documents"
          description="View, edit and export saved resumes & letters."
          emoji="📁"
          onPress={() => navigation.navigate("Documents")}
        />

        <FeatureCard
          title="Upgrade & Theme"
          description="Manage plan and switch light/dark mode."
          emoji="⭐"
          onPress={() => navigation.navigate("Upgrade")}
        />
      </ScrollView>
    </View>
  );
}

function FeatureCard({ title, description, emoji, onPress }) {
  const { theme } = useContext(AppContext);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.bgCard,
          borderColor: theme.border,
        },
      ]}
      onPress={onPress}
    >
      <Text style={styles.cardEmoji}>{emoji}</Text>
      <View style={styles.cardTextWrapper}>
        <Text
          style={[
            styles.cardTitle,
            { color: theme.textPrimary },
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.cardDescription,
            { color: theme.textSecondary },
          ]}
        >
          {description}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ---------- Optimize Resume ----------
function OptimizeResumeScreen({ navigation }) {
  const {
    theme,
    isPro,
    freeCreditsLeft,
    consumeCredit,
  } = useContext(AppContext);

  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [language, setLanguage] = useState("en"); // 'en' or 'tr'
  const [optimizedText, setOptimizedText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUseSample = () => {
    setResumeText(
      "Experienced Salesforce Consultant with 6+ years of hands-on experience " +
        "in Sales Cloud, Service Cloud and custom Apex development. Led multiple " +
        "end-to-end implementations, improved support KPIs and mentored junior developers."
    );
    setTargetRole("Senior Salesforce Developer");
  };

  const checkPaywall = () => {
    if (isPro) return true;
    if (freeCreditsLeft <= 0) {
      Alert.alert(
        "Limit reached",
        "You’ve used all free credits. Upgrade to Pro for unlimited access.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Upgrade",
            onPress: () => navigation.navigate("Upgrade"),
          },
        ]
      );
      return false;
    }
    consumeCredit();
    return true;
  };

  const handleRewrite = async () => {
    if (!resumeText.trim()) {
      Alert.alert(
        language === "tr" ? "Uyarı" : "Warning",
        language === "tr"
          ? "Lütfen CV metninizi girin."
          : "Please paste your resume text first."
      );
      return;
    }

    // If you have the paywall logic in this screen, keep it:
    if (typeof checkPaywall === "function") {
      if (!checkPaywall()) return;
    }

    setLoading(true);
    setOptimizedText("");

    try {
      const data = await optimizeResume({
        resumeText,
        targetRole,
        language,
      });

      if (!data || !data.optimizedText) {
        throw new Error("Missing optimizedText in response");
      }

      setOptimizedText(data.optimizedText);
      // (Optional) if you wanna debug where it came from:
      // console.log("Optimize source:", data.source);
    } catch (e) {
      console.log("Rewrite error:", e);
      Alert.alert(
        language === "tr" ? "Hata" : "Error",
        language === "tr"
          ? "CV yeniden yazılırken bir sorun oluştu."
          : "Something went wrong while rewriting your resume."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOptimized = async () => {
    if (!optimizedText) {
      Alert.alert(
        language === "tr" ? "Bilgi" : "Info",
        language === "tr"
          ? "Önce CV’yi yeniden yazdır."
          : "Generate an optimized resume first."
      );
      return;
    }
    const isTurkish = language === "tr";
    const doc = {
      id: Date.now().toString(),
      type: "optimized_resume",
      title:
        (isTurkish ? "Optimize CV - " : "Optimized Resume - ") +
        (targetRole || (isTurkish ? "Genel" : "General")),
      language,
      createdAt: new Date().toISOString(),
      content: optimizedText,
    };
    try {
      await addDocument(doc);
      Alert.alert(
        isTurkish ? "Kaydedildi" : "Saved",
        isTurkish
          ? "Belge 'My Documents' içinde saklandı."
          : "Document has been saved to My Documents."
      );
    } catch (e) {
      Alert.alert(
        isTurkish ? "Hata" : "Error",
        isTurkish
          ? "Belge kaydedilirken bir sorun oluştu."
          : "Something went wrong while saving."
      );
    }
  };

  const isTurkish = language === "tr";

  return (
    <View
      style={[
        styles.optimizeContainer,
        { backgroundColor: theme.bg },
      ]}
    >
      <ScrollView contentContainerStyle={styles.optimizeScroll} keyboardShouldPersistTaps="handled" >
         <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", }}  > 
          <Text style={[ styles.sectionTitle, { color: theme.textPrimary }, ]}  >
            {isTurkish ? "CV'ni Optimize Et" : "Optimize Your Resume"}
          </Text>
          <ProBadge />
        </View>
         <UsageBanner />
        <Text style={[ styles.sectionSubtitle, { color: theme.textSecondary }, ]} >
          {isTurkish
            ? "CV metnini yapıştır, hedef pozisyonu seç ve AI senin için daha güçlü bir versiyon üretsin."
            : "Paste your resume, set your target role and let AI generate a stronger version for you."}
        </Text>

        {/* Language toggle */}
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

        {/* Target role */}
        <Text
          style={[
            styles.inputLabel,
            { color: theme.textPrimary },
          ]}
        >
          {isTurkish ? "Hedef Pozisyon (opsiyonel)" : "Target Role (optional)"}
        </Text>
        <TextInput
          value={targetRole}
          onChangeText={setTargetRole}
          placeholder={
            isTurkish
              ? "Ör: Kıdemli Salesforce Geliştiricisi"
              : "e.g. Senior Salesforce Developer"
          }
          placeholderTextColor="#6b7280"
          style={[
            styles.input,
            {
              backgroundColor: theme.bg,
              borderColor: theme.border,
              color: theme.textPrimary,
            },
          ]}
        />

        {/* Resume input */}
        <Text
          style={[
            styles.inputLabel,
            { color: theme.textPrimary },
          ]}
        >
          {isTurkish ? "Mevcut CV Metnin" : "Your Current Resume Text"}
        </Text>
        <TextInput
          value={resumeText}
          onChangeText={setResumeText}
          placeholder={
            isTurkish
              ? "CV’ni buraya yapıştır veya yaz..."
              : "Paste or type your resume here..."
          }
          placeholderTextColor="#6b7280"
          style={[
            styles.textArea,
            {
              backgroundColor: theme.bg,
              borderColor: theme.border,
              color: theme.textPrimary,
            },
          ]}
          multiline={true}
          textAlignVertical="top"
        />

        {/* Sample + Rewrite */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.secondaryButton,
              { borderColor: theme.border },
            ]}
            onPress={handleUseSample}
          >
            <Text
              style={[
                styles.secondaryButtonText,
                { color: theme.textPrimary },
              ]}
            >
              {isTurkish ? "Örnek CV Kullan" : "Use Sample Resume"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.primaryButtonWide,
              { backgroundColor: theme.accent },
            ]}
            onPress={handleRewrite}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.textOnAccent} />
            ) : (
              <Text
                style={[
                  styles.primaryButtonText,
                  { color: theme.textOnAccent },
                ]}
              >
                {isTurkish ? "CV'yi Yeniden Yaz" : "Rewrite My Resume"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Result */}
        {optimizedText ? (
          <View
            style={[
              styles.resultBox,
              {
                backgroundColor: theme.bgCard,
                borderColor: theme.border,
              },
            ]}
          >
            <Text
              style={[
                styles.resultTitle,
                { color: theme.textPrimary },
              ]}
            >
              {isTurkish ? "Sonuç" : "Optimized Version"}
            </Text>
            <Text
              style={[
                styles.resultText,
                { color: theme.textSecondary },
              ]}
            >
              {optimizedText}
            </Text>

            <TouchableOpacity
              style={[
                styles.secondaryButton,
                { marginTop: 10, borderColor: theme.border },
              ]}
              onPress={handleSaveOptimized}
            >
              <Text
                style={[
                  styles.secondaryButtonText,
                  { color: theme.textPrimary },
                ]}
              >
                {isTurkish ? "Belgelerime Kaydet" : "Save to My Documents"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

// ---------- Job Match ----------
function JobMatchScreen({ navigation }) {
  const {
    theme,
    isPro,
    freeCreditsLeft,
    consumeCredit,
  } = useContext(AppContext);

  const [language, setLanguage] = useState("en");
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tailoredResume, setTailoredResume] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [loadingResume, setLoadingResume] = useState(false);
  const [loadingCoverLetter, setLoadingCoverLetter] = useState(false);

  const isTurkish = language === "tr";

  const checkPaywall = () => {
    if (isPro) return true;
    if (freeCreditsLeft <= 0) {
      Alert.alert(
        "Limit reached",
        "You’ve used all free credits. Upgrade to Pro for unlimited access.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Upgrade",
            onPress: () => navigation.navigate("Upgrade"),
          },
        ]
      );
      return false;
    }
    consumeCredit();
    return true;
  };

  const handleUseSample = () => {
    setResumeText(
      "Experienced Salesforce Consultant with 6+ years of hands-on experience in Sales Cloud, Service Cloud and Apex development. " +
        "Implemented end-to-end CRM solutions, optimized support processes and coached junior developers."
    );
    setJobDescription(
      "We are looking for a Senior Salesforce Developer who will design, implement and optimize Sales & Service Cloud solutions. " +
        "The ideal candidate has strong Apex, LWC experience and can work closely with business stakeholders."
    );
  };

  const handleTailorResume = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      Alert.alert(
        isTurkish ? "Uyarı" : "Warning",
        isTurkish
          ? "Lütfen hem CV metnini hem de iş ilanı metnini girin."
          : "Please provide both your resume and the job description."
      );
      return;
    }

    if (typeof checkPaywall === "function") {
      if (!checkPaywall()) return;
    }

    setLoadingResume(true);
    setTailoredResume("");

    try {
      const data = await jobMatchResume({
        resumeText,
        jobDescription,
        language,
      });

      if (!data || !data.tailoredResume) {
        throw new Error("Missing tailoredResume in response");
      }

      setTailoredResume(data.tailoredResume);
      // Optional debug:
      // console.log("Job match source:", data.source);
    } catch (e) {
      console.log("Tailor resume error:", e);
      Alert.alert(
        isTurkish ? "Hata" : "Error",
        isTurkish
          ? "CV ilana göre uyarlanırken bir sorun oluştu."
          : "Something went wrong while tailoring your resume."
      );
    } finally {
      setLoadingResume(false);
    }
  };
  const handleGenerateCoverLetter = async () => {
    if (!jobDescription.trim()) {
      Alert.alert(
        isTurkish ? "Uyarı" : "Warning",
        isTurkish
          ? "Lütfen iş ilanı metnini gir."
          : "Please provide the job description."
      );
      return;
    }

    if (typeof checkPaywall === "function") {
      if (!checkPaywall()) return;
    }

    setLoadingCoverLetter(true);
    setCoverLetter("");

    try {
      const data = await generateCoverLetter({
        resumeText,
        jobDescription,
        language,
      });

      if (!data || !data.coverLetter) {
        throw new Error("Missing coverLetter in response");
      }

      setCoverLetter(data.coverLetter);
      // console.log("Cover letter source:", data.source);
    } catch (e) {
      console.log("Cover letter error:", e);
      Alert.alert(
        isTurkish ? "Hata" : "Error",
        isTurkish
          ? "Ön yazı oluşturulurken bir sorun oluştu."
          : "Something went wrong while generating the cover letter."
      );
    } finally {
      setLoadingCoverLetter(false);
    }
  };

  const handleSaveTailoredResume = async () => {
    if (!tailoredResume) {
      Alert.alert(
        isTurkish ? "Bilgi" : "Info",
        isTurkish
          ? "Önce ilana göre uyarlanmış CV’yi oluştur."
          : "Generate a tailored resume first."
      );
      return;
    }
    const doc = {
      id: Date.now().toString() + "_tr",
      type: "tailored_resume",
      title: isTurkish ? "İlana Göre CV" : "Tailored Resume",
      language,
      createdAt: new Date().toISOString(),
      content: tailoredResume,
    };
    try {
      await addDocument(doc);
      Alert.alert(
        isTurkish ? "Kaydedildi" : "Saved",
        isTurkish
          ? "CV 'My Documents' içine kaydedildi."
          : "Tailored resume saved to My Documents."
      );
    } catch (e) {
      Alert.alert(
        isTurkish ? "Hata" : "Error",
        isTurkish
          ? "Belge kaydedilirken bir sorun oluştu."
          : "Something went wrong while saving."
      );
    }
  };

  const handleSaveCoverLetter = async () => {
    if (!coverLetter) {
      Alert.alert(
        isTurkish ? "Bilgi" : "Info",
        isTurkish
          ? "Önce ön yazıyı oluştur."
          : "Generate a cover letter first."
      );
      return;
    }
    const doc = {
      id: Date.now().toString() + "_cl",
      type: "cover_letter",
      title: isTurkish ? "Ön Yazı" : "Cover Letter",
      language,
      createdAt: new Date().toISOString(),
      content: coverLetter,
    };
    try {
      await addDocument(doc);
      Alert.alert(
        isTurkish ? "Kaydedildi" : "Saved",
        isTurkish
          ? "Ön yazı 'My Documents' içine kaydedildi."
          : "Cover letter saved to My Documents."
      );
    } catch (e) {
      Alert.alert(
        isTurkish ? "Hata" : "Error",
        isTurkish
          ? "Belge kaydedilirken bir sorun oluştu."
          : "Something went wrong while saving."
      );
    }
  };

  return (
    <View
      style={[
        styles.optimizeContainer,
        { backgroundColor: theme.bg },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.optimizeScroll}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.textPrimary },
            ]}
          >
            {isTurkish ? "İlana Göre CV Eşleştirme" : "Match Resume to Job Description"}
          </Text>
          <ProBadge />
        </View>
        <UsageBanner />
        <Text
          style={[
            styles.sectionSubtitle,
            { color: theme.textSecondary },
          ]}
        >
          {isTurkish
            ? "CV’ni ve iş ilanını gir, AI senin için hem uyarlanmış bir CV özeti hem de ön yazı oluştursun."
            : "Provide your resume and the job description, and let AI tailor both your resume and a cover letter for this role."}
        </Text>

        {/* Language toggle */}
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

        {/* Resume */}
        <Text
          style={[
            styles.inputLabel,
            { color: theme.textPrimary },
          ]}
        >
          {isTurkish ? "Mevcut CV Metnin" : "Your Resume Text"}
        </Text>
        <TextInput
          value={resumeText}
          onChangeText={setResumeText}
          placeholder={
            isTurkish
              ? "CV’ni buraya yapıştır..."
              : "Paste your resume here..."
          }
          placeholderTextColor="#6b7280"
          style={[
            styles.textArea,
            {
              backgroundColor: theme.bg,
              borderColor: theme.border,
              color: theme.textPrimary,
            },
          ]}
          multiline={true}
          textAlignVertical="top"
        />

        {/* Job description */}
        <Text
          style={[
            styles.inputLabel,
            { color: theme.textPrimary },
          ]}
        >
          {isTurkish ? "İş İlanı / Pozisyon Açıklaması" : "Job Description"}
        </Text>
        <TextInput
          value={jobDescription}
          onChangeText={setJobDescription}
          placeholder={
            isTurkish
              ? "İş ilanı metnini buraya yapıştır..."
              : "Paste the job description here..."
          }
          placeholderTextColor="#6b7280"
          style={[
            styles.textArea,
            {
              backgroundColor: theme.bg,
              borderColor: theme.border,
              color: theme.textPrimary,
            },
          ]}
          multiline={true}
          textAlignVertical="top"
        />

        {/* Sample + Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.secondaryButton,
              { borderColor: theme.border },
            ]}
            onPress={handleUseSample}
          >
            <Text
              style={[
                styles.secondaryButtonText,
                { color: theme.textPrimary },
              ]}
            >
              {isTurkish ? "Örnek Kullan" : "Use Sample Data"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.primaryButtonWide,
              { backgroundColor: theme.accent },
            ]}
            onPress={handleTailorResume}
            disabled={loadingResume}
          >
            {loadingResume ? (
              <ActivityIndicator color={theme.textOnAccent} />
            ) : (
              <Text
                style={[
                  styles.primaryButtonText,
                  { color: theme.textOnAccent },
                ]}
              >
                {isTurkish ? "CV'yi İlana Uyarla" : "Tailor Resume"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.primaryButtonWide,
            { marginBottom: 16, backgroundColor: theme.accent },
          ]}
          onPress={handleGenerateCoverLetter}
          disabled={loadingCoverLetter}
        >
          {loadingCoverLetter ? (
            <ActivityIndicator color={theme.textOnAccent} />
          ) : (
            <Text
              style={[
                styles.primaryButtonText,
                { color: theme.textOnAccent },
              ]}
            >
              {isTurkish ? "Ön Yazı Oluştur" : "Generate Cover Letter"}
            </Text>
          )}
        </TouchableOpacity>

        {/* Tailored resume result */}
        {tailoredResume ? (
          <View
            style={[
              styles.resultBox,
              {
                marginBottom: 12,
                backgroundColor: theme.bgCard,
                borderColor: theme.border,
              },
            ]}
          >
            <Text
              style={[
                styles.resultTitle,
                { color: theme.textPrimary },
              ]}
            >
              {isTurkish ? "İlana Göre Uyarlanmış CV" : "Tailored Resume"}
            </Text>
            <Text
              style={[
                styles.resultText,
                { color: theme.textSecondary },
              ]}
            >
              {tailoredResume}
            </Text>

            <TouchableOpacity
              style={[
                styles.secondaryButton,
                { marginTop: 10, borderColor: theme.border },
              ]}
              onPress={handleSaveTailoredResume}
            >
              <Text
                style={[
                  styles.secondaryButtonText,
                  { color: theme.textPrimary },
                ]}
              >
                {isTurkish ? "Belgelerime Kaydet" : "Save to My Documents"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Cover letter result */}
        {coverLetter ? (
          <View
            style={[
              styles.resultBox,
              {
                backgroundColor: theme.bgCard,
                borderColor: theme.border,
              },
            ]}
          >
            <Text
              style={[
                styles.resultTitle,
                { color: theme.textPrimary },
              ]}
            >
              {isTurkish ? "Ön Yazı" : "Cover Letter"}
            </Text>
            <Text
              style={[
                styles.resultText,
                { color: theme.textSecondary },
              ]}
            >
              {coverLetter}
            </Text>

            <TouchableOpacity
              style={[
                styles.secondaryButton,
                { marginTop: 10, borderColor: theme.border },
              ]}
              onPress={handleSaveCoverLetter}
            >
              <Text
                style={[
                  styles.secondaryButtonText,
                  { color: theme.textPrimary },
                ]}
              >
                {isTurkish ? "Belgelerime Kaydet" : "Save to My Documents"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

// ---------- Interview Coach ----------
function InterviewCoachScreen({ navigation }) {
  const {
    theme,
    isPro,
    freeCreditsLeft,
    consumeCredit,
  } = useContext(AppContext);

  const [language, setLanguage] = useState("en"); // 'en' or 'tr'
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("mid");
  const [mode, setMode] = useState("quick");
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const isTurkish = language === "tr";

  const checkPaywall = () => {
    if (isPro) return true;
    if (freeCreditsLeft <= 0) {
      Alert.alert(
        "Limit reached",
        "You’ve used all free credits. Upgrade to Pro for unlimited access.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Upgrade",
            onPress: () => navigation.navigate("Upgrade"),
          },
        ]
      );
      return false;
    }
    consumeCredit();
    return true;
  };

  const startSession = async () => {
    if (!role.trim()) {
      Alert.alert(
        isTurkish ? "Uyarı" : "Warning",
        isTurkish
          ? "Lütfen hedef pozisyonu gir."
          : "Please enter a target role."
      );
      return;
    }

    if (typeof checkPaywall === "function") {
      if (!checkPaywall()) return;
    }

    try {
      setLoading(true);
      setFeedback("");
      setCurrentAnswer("");
      setQuestions([]);

      const data = await getInterviewQuestions({
        role,
        level,
        mode,
        language,
      });

      if (!data || !Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error("No questions returned");
      }

      setQuestions(data.questions);
      setCurrentIndex(0);
      setSessionActive(true);
    } catch (e) {
      console.log("Start session error:", e);
      Alert.alert(
        isTurkish ? "Hata" : "Error",
        isTurkish
          ? "Sorular alınırken bir sorun oluştu."
          : "Something went wrong while fetching questions."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGetFeedback = async () => {
    if (!currentAnswer.trim()) {
      Alert.alert(
        isTurkish ? "Uyarı" : "Warning",
        isTurkish
          ? "Lütfen cevap alanını doldur."
          : "Please write your answer first."
      );
      return;
    }

    if (typeof checkPaywall === "function") {
      if (!checkPaywall()) return;
    }

    setLoading(true);
    setFeedback("");

    try {
      const data = await getInterviewFeedback({
        question: currentQuestion || "",
        answer: currentAnswer,
        language,
      });

      if (!data || !data.feedback) {
        throw new Error("Missing feedback in response");
      }

      setFeedback(data.feedback);
      // If later you add a score state, you can read data.score here.
    } catch (e) {
      console.log("Interview feedback error:", e);
      Alert.alert(
        isTurkish ? "Hata" : "Error",
        isTurkish
          ? "Geri bildirim alınırken bir sorun oluştu."
          : "Something went wrong while getting feedback."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 >= questions.length) {
      setSessionActive(false);
      Alert.alert(
        isTurkish ? "Tebrikler" : "Nice work!",
        isTurkish
          ? "Oturumu tamamladın. İstersen yeni bir rolle tekrar deneyebilirsin."
          : "You’ve completed this session. You can start a new one with another role if you like."
      );
      return;
    }
    setCurrentIndex(currentIndex + 1);
    setCurrentAnswer("");
    setFeedback("");
  };

  const currentQuestion =
    sessionActive && questions.length > 0 ? questions[currentIndex] : null;

  return (
    <View
      style={[
        styles.optimizeContainer,
        { backgroundColor: theme.bg },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.optimizeScroll}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.textPrimary },
            ]}
          >
            {isTurkish ? "Mülakat Koçu" : "Interview Coach"}
          </Text>
          <ProBadge />
        </View>
          <UsageBanner />
        <Text
          style={[
            styles.sectionSubtitle,
            { color: theme.textSecondary },
          ]}
        >
          {isTurkish
            ? "Hedef pozisyonun için mülakat sorularını prova et, her cevabına anında geri bildirim al."
            : "Practice interview questions for your target role and get instant feedback on each answer."}
        </Text>

        {/* Language toggle */}
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

        {/* Role input */}
        <Text
          style={[
            styles.inputLabel,
            { color: theme.textPrimary },
          ]}
        >
          {isTurkish ? "Hedef Pozisyon" : "Target Role"}
        </Text>
        <TextInput
          value={role}
          onChangeText={setRole}
          placeholder={
            isTurkish
              ? "Ör: Kıdemli Salesforce Geliştiricisi"
              : "e.g. Senior Salesforce Developer"
          }
          placeholderTextColor="#6b7280"
          style={[
            styles.input,
            {
              backgroundColor: theme.bg,
              borderColor: theme.border,
              color: theme.textPrimary,
            },
          ]}
        />

        {/* Level selector */}
        <Text
          style={[
            styles.inputLabel,
            { color: theme.textPrimary },
          ]}
        >
          {isTurkish ? "Seviye" : "Seniority Level"}
        </Text>
        <View style={styles.coachChipRow}>
          {[
            { key: "junior", labelTr: "Junior", labelEn: "Junior" },
            { key: "mid", labelTr: "Mid", labelEn: "Mid-level" },
            { key: "senior", labelTr: "Senior", labelEn: "Senior" },
          ].map((item) => {
            const selected = level === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.coachChip,
                  selected && styles.coachChipActive,
                  {
                    borderColor: selected
                      ? theme.accent
                      : theme.border,
                  },
                ]}
                onPress={() => setLevel(item.key)}
              >
                <Text
                  style={[
                    styles.coachChipText,
                    {
                      color: theme.textPrimary,
                      fontWeight: selected ? "600" : "400",
                    },
                  ]}
                >
                  {isTurkish ? item.labelTr : item.labelEn}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Mode selector */}
        <Text
          style={[
            styles.inputLabel,
            { color: theme.textPrimary },
          ]}
        >
          {isTurkish ? "Oturum Türü" : "Session Type"}
        </Text>
        <View style={styles.coachChipRow}>
          {[
            {
              key: "quick",
              labelTr: "Kısa (5 soru)",
              labelEn: "Quick (5 questions)",
            },
            {
              key: "deep",
              labelTr: "Derin (10 soru)",
              labelEn: "Deep (10 questions)",
            },
          ].map((item) => {
            const selected = mode === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.coachChip,
                  selected && styles.coachChipActive,
                  {
                    borderColor: selected
                      ? theme.accent
                      : theme.border,
                  },
                ]}
                onPress={() => setMode(item.key)}
              >
                <Text
                  style={[
                    styles.coachChipText,
                    {
                      color: theme.textPrimary,
                      fontWeight: selected ? "600" : "400",
                    },
                  ]}
                >
                  {isTurkish ? item.labelTr : item.labelEn}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Start session button */}
        <TouchableOpacity
          style={[
            styles.primaryButtonWide,
            {
              marginBottom: 16,
              marginTop: 4,
              backgroundColor: theme.accent,
            },
          ]}
          onPress={startSession}
        >
          <Text
            style={[
              styles.primaryButtonText,
              { color: theme.textOnAccent },
            ]}
          >
            {isTurkish ? "Oturumu Başlat" : "Start Session"}
          </Text>
        </TouchableOpacity>

        {/* Question + answer area */}
        {currentQuestion && (
          <View
            style={[
              styles.coachQuestionBox,
              {
                borderColor: theme.border,
                backgroundColor: theme.bgCard,
              },
            ]}
          >
            <Text
              style={[
                styles.coachProgressText,
                { color: theme.textSecondary },
              ]}
            >
              {isTurkish ? "Soru" : "Question"} {currentIndex + 1} /{" "}
              {questions.length}
            </Text>
            <Text
              style={[
                styles.coachQuestionText,
                { color: theme.textPrimary },
              ]}
            >
              {currentQuestion}
            </Text>

            <TextInput
              value={currentAnswer}
              onChangeText={setCurrentAnswer}
              placeholder={
                isTurkish
                  ? "Cevabını buraya yaz..."
                  : "Type your answer here..."
              }
              placeholderTextColor="#6b7280"
              style={[
                styles.coachAnswerInput,
                {
                  backgroundColor: theme.bg,
                  borderColor: theme.border,
                  color: theme.textPrimary,
                },
              ]}
              multiline={true}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[
                styles.primaryButtonWide,
                { marginTop: 8, backgroundColor: theme.accent },
              ]}
              onPress={handleGetFeedback}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.textOnAccent} />
              ) : (
                <Text
                  style={[
                    styles.primaryButtonText,
                    { color: theme.textOnAccent },
                  ]}
                >
                  {isTurkish ? "Geri Bildirim Al" : "Get Feedback"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Feedback + next question */}
        {feedback ? (
          <View
            style={[
              styles.resultBox,
              {
                marginTop: 12,
                backgroundColor: theme.bgCard,
                borderColor: theme.border,
              },
            ]}
          >
            <Text
              style={[
                styles.resultTitle,
                { color: theme.textPrimary },
              ]}
            >
              {isTurkish ? "Geri Bildirim" : "Feedback"}
            </Text>
            <Text
              style={[
                styles.resultText,
                { color: theme.textSecondary },
              ]}
            >
              {feedback}
            </Text>

            <TouchableOpacity
              style={[
                styles.secondaryButton,
                { marginTop: 10, borderColor: theme.border },
              ]}
              onPress={handleNextQuestion}
            >
              <Text
                style={[
                  styles.secondaryButtonText,
                  { color: theme.textPrimary },
                ]}
              >
                {currentIndex + 1 >= questions.length
                  ? isTurkish
                    ? "Oturumu Bitir"
                    : "Finish Session"
                  : isTurkish
                  ? "Sonraki Soru"
                  : "Next Question"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

// ---------- My Documents ----------
function DocumentsScreen() {
  const { theme } = useContext(AppContext);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const loadDocs = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getDocuments();
      setDocs(list);
      if (list.length === 0) {
        setSelectedId(null);
      } else if (selectedId) {
        const exists = list.find((d) => d.id === selectedId);
        if (!exists) setSelectedId(list[0].id);
      } else {
        setSelectedId(list[0]?.id || null);
      }
    } catch (e) {
      console.log("Load docs error:", e);
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useFocusEffect(
    useCallback(() => {
      loadDocs();
    }, [loadDocs])
  );

  const handleDelete = async (id) => {
    Alert.alert("Delete", "Delete this document?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const updated = await removeDocument(id);
            setDocs(updated);
            if (selectedId === id) {
              setSelectedId(updated[0]?.id || null);
            }
          } catch (e) {
            Alert.alert("Error", "Could not delete document.");
          }
        },
      },
    ]);
  };

  const selectedDoc = docs.find((d) => d.id === selectedId) || null;

  const handleExportPdf = async () => {
    if (!selectedDoc) {
      Alert.alert("Info", "Select a document first.");
      return;
    }

    try {
      const sharingAvailable = await Sharing.isAvailableAsync();
      if (!sharingAvailable) {
        Alert.alert(
          "Not supported",
          "Sharing is not available on this device/emulator."
        );
      }

      /*
      const html = `
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              body {
                font-family: -apple-system, system-ui, sans-serif;
                padding: 24px;
                color: #111827;
              }
              h1 {
                font-size: 22px;
                margin-bottom: 12px;
              }
              .meta {
                font-size: 12px;
                color: #6b7280;
                margin-bottom: 16px;
              }
              pre {
                white-space: pre-wrap;
                font-size: 13px;
                line-height: 1.5;
              }
            </style>
          </head>
          <body>
            <h1>${selectedDoc.title || "Document"}</h1>
            <div class="meta">
              ${selectedDoc.type || "document"} · ${
        selectedDoc.language?.toUpperCase() || ""
      } · ${formatDate(selectedDoc.createdAt)}
            </div>
            <pre>${selectedDoc.content
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")}</pre>
          </body>
        </html>
      `;
      */

      const html = buildResumeHtml({
        content: documentText,        // whatever text you're exporting
        template: selectedTemplateId, // "classic" | "modern" | "minimal"
        title: documentTitle,
      });

      const { uri } = await Print.printToFileAsync({ html });

      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Share PDF",
      });
    } catch (e) {
      console.log("Export PDF error:", e);
      Alert.alert("Error", "Could not export PDF.");
    }
  };

  return (
    <View
      style={[
        styles.optimizeContainer,
        { backgroundColor: theme.bg },
      ]}
    >
      <ScrollView contentContainerStyle={styles.optimizeScroll}>
        <Text
          style={[
            styles.sectionTitle,
            { color: theme.textPrimary },
          ]}
        >
          My Documents
        </Text>
        <Text
          style={[
            styles.sectionSubtitle,
            { color: theme.textSecondary },
          ]}
        >
          Saved resumes, tailored versions and cover letters.
        </Text>

        {loading && (
          <ActivityIndicator
            style={{ marginVertical: 12 }}
            color={theme.textPrimary}
          />
        )}

        {docs.length === 0 && !loading ? (
          <Text
            style={[
              styles.sectionSubtitle,
              { marginTop: 12, color: theme.textSecondary },
            ]}
          >
            You don't have any saved documents yet. Generate an optimized
            resume or cover letter and save it here.
          </Text>
        ) : null}

        {docs.map((doc) => {
          const isActive = doc.id === selectedId;
          return (
            <View
              key={doc.id}
              style={[
                styles.docItem,
                {
                  borderColor: isActive ? theme.accent : theme.border,
                  backgroundColor: theme.bgCard,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.docItemHeader}
                onPress={() => setSelectedId(doc.id)}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.docTitle,
                      { color: theme.textPrimary },
                    ]}
                    numberOfLines={1}
                  >
                    {doc.title}
                  </Text>
                  <Text
                    style={[
                      styles.docMeta,
                      { color: theme.textSecondary },
                    ]}
                    numberOfLines={1}
                  >
                    {doc.type} · {doc.language?.toUpperCase()} ·{" "}
                    {formatDate(doc.createdAt)}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => handleDelete(doc.id)}
                  style={styles.docDeleteButton}
                >
                  <Text style={styles.docDeleteText}>✕</Text>
                </TouchableOpacity>
              </TouchableOpacity>

              {isActive ? (
                <View style={styles.docContentBox}>
                  <Text
                    style={[
                      styles.resultText,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {doc.content}
                  </Text>

                  <TouchableOpacity
                    style={[
                      styles.secondaryButton,
                      {
                        marginTop: 10,
                        borderColor: theme.border,
                      },
                    ]}
                    onPress={handleExportPdf}
                  >
                    <Text
                      style={[
                        styles.secondaryButtonText,
                        { color: theme.textPrimary },
                      ]}
                    >
                      Export as PDF
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ---------- Upgrade / Paywall & Theme ----------
function UpgradeScreen() {
  const {
    theme,
    themeName,
    toggleTheme,
    isPro,
    upgradeToPro,
    freeCreditsLeft,
  } = useContext(AppContext);

  const [offerings, setOfferings] = useState(null);
  const [loadingOfferings, setLoadingOfferings] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);

  useEffect(() => {
    const loadOfferings = async () => {
      try {
        const o = await Purchases.getOfferings();
        setOfferings(o.current);
      } catch (e) {
        console.log("RevenueCat offerings error:", e);
      } finally {
        setLoadingOfferings(false);
      }
    };

    loadOfferings();
  }, []);

  const handlePurchase = async () => {
    try {
      if (!offerings || !offerings.availablePackages?.length) {
        Alert.alert(
          "No packages",
          "No products are configured in the RevenueCat store yet."
        );
        return;
      }

      const pkg = offerings.availablePackages[0];
      setPurchaseLoading(true);

      const { customerInfo } = await Purchases.purchasePackage(pkg);

      console.log(
        "RevenueCat customerInfo.entitlements.active:",
        customerInfo.entitlements.active
      );

      const hasPro =
        customerInfo.entitlements?.active?.premium != null;

      if (hasPro) {
        upgradeToPro();
        Alert.alert("Success", "You are now ResumeIQ Pro 🎉");
      } else {
        Alert.alert(
          "Info",
          "Purchase completed but Pro entitlement is not active. Check RevenueCat config."
        );
      }
    } catch (e) {
      console.log("Purchase error:", e);

      if (!e.userCancelled) {
        Alert.alert(
          "Error",
          "Something went wrong while processing your purchase."
        );
      }
    } finally {
      setPurchaseLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      setRestoreLoading(true);

      const customerInfo = await Purchases.restorePurchases();

      console.log(
        "Restore customerInfo.entitlements.active:",
        customerInfo.entitlements.active
      );

      const hasPro = customerInfo.entitlements?.active?.premium != null;

      if (hasPro) {
        upgradeToPro();
        Alert.alert(
          "Restored",
          "Your ResumeIQ Pro membership has been restored 🎉"
        );
      } else {
        Alert.alert(
          "No purchases",
          "No active Pro subscription found to restore."
        );
      }
    } catch (e) {
      console.log("Restore error:", e);
      Alert.alert(
        "Error",
        "Something went wrong while restoring purchases."
      );
    } finally {
      setRestoreLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.optimizeContainer,
        { backgroundColor: theme.bg },
      ]}
    >
      <ScrollView contentContainerStyle={styles.optimizeScroll}>
        <Text
          style={[
            styles.sectionTitle,
            { color: theme.textPrimary },
          ]}
        >
          {isPro ? "You are Pro 🎉" : "Upgrade to Pro"}
        </Text>
        <Text
          style={[
            styles.sectionSubtitle,
            { color: theme.textSecondary },
          ]}
        >
          {isPro
            ? "You have unlimited access to resume optimization, job matching and interview coaching."
            : "Unlock unlimited resume rewrites, job-specific tailoring and interview coaching without limits."}
        </Text>

        {!isPro && (
          <View
            style={[
              styles.resultBox,
              {
                backgroundColor: theme.bgCard,
                borderColor: theme.border,
              },
            ]}
          >
            <Text
              style={[
                styles.resultTitle,
                { color: theme.textPrimary },
              ]}
            >
              What you get
            </Text>
            <Text
              style={[
                styles.resultText,
                { color: theme.textSecondary },
              ]}
            >
              • Unlimited resume optimizations{"\n"}
              • Unlimited job description tailoring{"\n"}
              • Unlimited cover letter generations{"\n"}
              • Unlimited interview coaching sessions{"\n"}
              • Priority improvements & new features
            </Text>

            {/* Purchase button */}
            <TouchableOpacity
              style={[
                styles.primaryButtonWide,
                {
                  marginTop: 16,
                  backgroundColor: theme.accent,
                  opacity:
                    purchaseLoading || loadingOfferings ? 0.7 : 1,
                },
              ]}
              onPress={handlePurchase}
              disabled={purchaseLoading || loadingOfferings}
            >
              {purchaseLoading ? (
                <ActivityIndicator color={theme.textOnAccent} />
              ) : (
                <Text
                  style={[
                    styles.primaryButtonText,
                    { color: theme.textOnAccent },
                  ]}
                >
                  {loadingOfferings
                    ? "Loading options..."
                    : "Unlock Pro (Test Store)"}
                </Text>
              )}
            </TouchableOpacity>

            {/* Restore button */}
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                {
                  marginTop: 12,
                  borderColor: theme.border,
                  opacity: restoreLoading ? 0.7 : 1,
                },
              ]}
              onPress={handleRestore}
              disabled={restoreLoading}
            >
              {restoreLoading ? (
                <ActivityIndicator color={theme.textPrimary} />
              ) : (
                <Text
                  style={[
                    styles.secondaryButtonText,
                    { color: theme.textPrimary },
                  ]}
                >
                  Restore Purchases
                </Text>
              )}
            </TouchableOpacity>

            <Text
              style={[
                styles.sectionSubtitle,
                {
                  marginTop: 12,
                  color: theme.textSecondary,
                },
              ]}
            >
              Free credits left: {freeCreditsLeft}
            </Text>

            <Text
              style={[
                styles.sectionSubtitle,
                {
                  marginTop: 4,
                  fontSize: 12,
                  color: theme.textSecondary,
                  textAlign: "center",
                },
              ]}
            >
              Using RevenueCat Test Store – no real charges in dev.
            </Text>
          </View>
        )}

        {/* Theme section (unchanged) */}
        <View style={{ height: 24 }} />

        <Text
          style={[
            styles.sectionTitle,
            { marginBottom: 8, color: theme.textPrimary },
          ]}
        >
          Theme
        </Text>
        <Text
          style={[
            styles.sectionSubtitle,
            { marginBottom: 12, color: theme.textSecondary },
          ]}
        >
          Current: {themeName === "dark" ? "Dark" : "Light"}
        </Text>

        <View style={styles.languageToggleWrapper}>
          <TouchableOpacity
            style={[
              styles.languageButton,
              themeName === "light" && styles.languageButtonActive,
            ]}
            onPress={() =>
              themeName !== "light" && toggleTheme()
            }
          >
            <Text
              style={[
                styles.languageButtonText,
                themeName === "light" &&
                  styles.languageButtonTextActive,
              ]}
            >
              Light
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.languageButton,
              themeName === "dark" && styles.languageButtonActive,
            ]}
            onPress={() =>
              themeName !== "dark" && toggleTheme()
            }
          >
            <Text
              style={[
                styles.languageButtonText,
                themeName === "dark" &&
                  styles.languageButtonTextActive,
              ]}
            >
              Dark
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// ---------- Root ----------
export default function App() {
  const [themeName, setThemeName] = useState("dark");
  const [isPro, setIsPro] = useState(false);
  const [freeCreditsLeft, setFreeCreditsLeft] = useState(5);

  const theme = themeName === "dark" ? darkTheme : lightTheme;

  const toggleTheme = () =>
    setThemeName((prev) => (prev === "dark" ? "light" : "dark"));

  const upgradeToPro = () => setIsPro(true);

  const consumeCredit = () => {
    setFreeCreditsLeft((current) => {
      if (isPro) return current;
      return current > 0 ? current - 1 : 0;
    });
  };

  const ctxValue = {
    theme,
    themeName,
    toggleTheme,
    isPro,
    upgradeToPro,
    freeCreditsLeft,
    consumeCredit,
  };

  useEffect(() => {
    Purchases.configure({
      apiKey:"test_occeutlxPVPolTrDEKYepIdSRbT"
    });
  }, []);

  return (
    <AppContext.Provider value={ctxValue}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: "AI Career Coach" }}
          />
          <Stack.Screen
            name="OptimizeResume"
            component={OptimizeResumeScreen}
            options={{ title: "Optimize Resume" }}
          />
          <Stack.Screen
            name="JobMatch"
            component={JobMatchScreen}
            options={{ title: "Match to Job" }}
          />
          <Stack.Screen
            name="InterviewCoach"
            component={InterviewCoachScreen}
            options={{ title: "Interview Coach" }}
          />
          <Stack.Screen
            name="Documents"
            component={DocumentsScreen}
            options={{ title: "My Documents" }}
          />
          <Stack.Screen
            name="Upgrade"
            component={UpgradeScreen}
            options={{ title: "Upgrade & Theme" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AppContext.Provider>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  // Welcome
  welcomeContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  appSubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  primaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 999,
  },
  primaryButtonText: {
    fontWeight: "600",
    fontSize: 16,
  },

  // Home
  homeContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  homeTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  homeSubtitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  cardList: {
    paddingBottom: 24,
  },

  // Card
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  cardEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  cardTextWrapper: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
  },

  // Shared sections
  optimizeContainer: {
    flex: 1,
  },
  optimizeScroll: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginBottom: 16,
  },
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
  inputLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 4,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 12,
  },
  textArea: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    minHeight: 160,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 4,
    marginBottom: 16,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: "500",
  },
  primaryButtonWide: {
    flex: 1.4,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  resultBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
  },
  resultText: {
    fontSize: 13,
  },

  // Interview coach
  coachChipRow: {
    flexDirection: "row",
    marginBottom: 8,
    marginTop: 4,
  },
  coachChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
  },
  coachChipText: {
    fontSize: 12,
  },
  coachQuestionBox: {
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  coachProgressText: {
    fontSize: 12,
    marginBottom: 4,
  },
  coachQuestionText: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  coachAnswerInput: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    minHeight: 120,
    marginTop: 4,
  },
  coachChipActive: {
    backgroundColor: "#0f172a",
  },

  // Documents
  docItem: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
  },
  docItemHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  docTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  docMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  docDeleteButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  docDeleteText: {
    color: "#f97373",
    fontSize: 16,
  },
  docContentBox: {
    marginTop: 8,
  },
});
