// app/context/AppContext.js
import React, { createContext, useMemo, useState, useContext, } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import styles from "../styles";

// ---------- Context & Themes ----------
export const AppContext = createContext(null);

const lightTheme = {
  bg: "#f9fafb",
  bgCard: "#ffffff",
  textPrimary: "#111827",
  textSecondary: "#6b7280",
  border: "#e5e7eb",
  accent: "#2563eb",
  textOnAccent: "#ffffff",
};

const darkTheme = {
  bg: "#020617",
  bgCard: "#0b1120",
  textPrimary: "#e5e7eb",
  textSecondary: "#9ca3af",
  border: "#1f2937",
  accent: "#38bdf8",
  textOnAccent: "#020617",
};

export function AppProvider({ children }) {
  const [themeName, setThemeName] = useState("dark"); // "light" | "dark"
  const [isPro, setIsPro] = useState(false);
  const [freeCreditsLeft, setFreeCreditsLeft] = useState(5);

  const theme = themeName === "dark" ? darkTheme : lightTheme;

  const toggleTheme = () => {
    setThemeName((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const upgradeToPro = () => {
    setIsPro(true);
  };

  const consumeCredit = () => {
    setFreeCreditsLeft((prev) => Math.max(0, prev - 1));
  };

  const value = useMemo(
    () => ({
      theme,
      themeName,
      toggleTheme,
      isPro,
      upgradeToPro,
      freeCreditsLeft,
      consumeCredit,
    }),
    [theme, themeName, isPro, freeCreditsLeft]
  );

  return (
    <AppContext.Provider value={value}>{children}</AppContext.Provider>
  );
}

// ---------- Storage helpers ----------
export const DOCS_STORAGE_KEY = "@resumeiq_docs_v2";

export function generateId() {
  return (
    Date.now().toString() +
    "_" +
    Math.random().toString(16).slice(2)
  );
}

export async function saveDocument({ title, type, content }) {
  try {
    const raw = await AsyncStorage.getItem(DOCS_STORAGE_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    const docs = Array.isArray(existing) ? existing : [];

    const newDoc = {
      id: generateId(),
      title: title || "Untitled",
      type: type || "resume", // "resume" | "job-match" | "cover-letter" | "interview"
      createdAt: Date.now(),
      content: content || "",
    };

    const next = [...docs, newDoc];
    await AsyncStorage.setItem( DOCS_STORAGE_KEY, JSON.stringify(next) );
  } catch (e) {
    console.log("saveDocument error:", e);
  }
}

export function formatDate(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleDateString();
}

export function getTypeLabel(type) {
  switch (type) {
    case "resume":
      return "Resume";
    case "job-match":
      return "Tailored Resume";
    case "cover-letter":
      return "Cover Letter";
    case "interview":
      return "Interview Notes";
    default:
      return "Document";
  }
}

export function getTypeColor(type, theme) {
  switch (type) {
    case "resume":
      return "#22c55e"; // green
    case "job-match":
      return "#3b82f6"; // blue
    case "cover-letter":
      return "#eab308"; // yellow
    case "interview":
      return "#a855f7"; // purple
    default:
      return theme.accent;
  }
}

// ---------- UI helpers ----------

export function ProBadge() {
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

export function LockIcon({ color = "#9ca3af", size = 14, style }) {
  return (
    <Text style={[ { fontSize: size, color, marginLeft: 6, }, style, ]} >
      🔒
    </Text>
  );
}

export function UsageBanner({ style }) {
  const { isPro, freeCreditsLeft, theme } = useContext(AppContext);

  if (isPro) {
    return (
      <Text style={[ styles.sectionSubtitle, { color: theme.textSecondary, marginTop: 4, marginBottom: 8, }, style, ]} >
        ✅ You are on{" "}
        <Text style={{ fontWeight: "600" }}>ResumeIQ Pro</Text>. Unlimited AI calls for resume, job match and interview coaching.
      </Text>
    );
  }

  return (
    <Text style={[ styles.sectionSubtitle, { color: theme.textSecondary, marginTop: 4, marginBottom: 8, }, style, ]} >
      Free plan:{" "}
      <Text style={{ fontWeight: "600" }}>
        {freeCreditsLeft} AI credits
      </Text>{" "}
      left today. Upgrade to Pro for unlimited usage.
    </Text>
  );
}

export function ProOnlyFeatureTile({ title, subtitle, onPress }) {
  const { isPro, theme } = useContext(AppContext);
  const navigation = useNavigation();
  const locked = !isPro;

  const handlePress = () => {
    if (locked) {
      navigation.navigate("Upgrade");
    } else if (onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity activeOpacity={0.8} style={[ styles.resultBox, { backgroundColor: theme.bgCard, borderColor: theme.border, opacity: locked ? 0.7 : 1, }, ]} onPress={handlePress} >
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4, }} >
        <Text style={[ styles.resultTitle, { color: theme.textPrimary }, ]} >
          {title}
        </Text>
        {locked && <LockIcon color={theme.textSecondary} />}
      </View>

      <Text style={[ styles.resultText, { color: theme.textSecondary }, ]} >
        {subtitle}
      </Text>

      {locked && (
        <Text style={{ marginTop: 8, fontSize: 12, color: theme.textSecondary, }} >
          Pro only feature – tap to upgrade.
        </Text>
      )}
    </TouchableOpacity>
  );
}

export function FeatureCard({ title, description, icon, onPress }) {
  const { theme } = useContext(AppContext);

  return (
    <TouchableOpacity style={[ styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border, }, ]} onPress={onPress} >
      <View style={styles.iconWrapper}>
        <Image source={icon} style={styles.iconImage} resizeMode="contain" />
      </View>
      <View style={styles.cardTextWrapper}>
        <Text style={[ styles.cardTitle, { color: theme.textPrimary }, ]} >
          {title}
        </Text>
        <Text style={[ styles.cardDescription, { color: theme.textSecondary }, ]} >
          {description}
        </Text>
      </View>
    </TouchableOpacity>
  );
}