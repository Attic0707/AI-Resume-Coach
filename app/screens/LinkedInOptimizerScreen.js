import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useAppContext } from "../context/AppContext";
import { optimizeLinkedInSection } from "../utils/api";

export default function LinkedInOptimizerScreen() {
  const { theme, canUseFeature, consumeCredit } = useAppContext();

  const [sectionType, setSectionType] = useState("about"); // "about" | "experience"
  const [linkedInText, setLinkedInText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [optimizedText, setOptimizedText] = useState("");

  const isTurkish = false; // wire later if needed

  const handleOptimize = async () => {
    if (!linkedInText.trim()) {
      Alert.alert(
        isTurkish ? "Uyarı" : "Warning",
        isTurkish
          ? "Lütfen LinkedIn metnini yapıştır."
          : "Please paste your LinkedIn text first."
      );
      return;
    }

    if (linkedInText.length > 8000) {
      Alert.alert(
        isTurkish ? "Uyarı" : "Warning",
        isTurkish
          ? "Metin çok uzun (maksimum 8.000 karakter)."
          : "Text is too long (max 8,000 characters)."
      );
      return;
    }

    if (!canUseFeature()) return;

    try {
      setLoading(true);
      setOptimizedText("");

      const language = isTurkish ? "tr" : "en";
      const data = await optimizeLinkedInSection({ linkedInText, sectionType, targetRole, language, });

      if (!data || !data.optimizedText) {
        throw new Error("Missing optimizedText in response");
      }

      setOptimizedText(data.optimizedText);
      consumeCredit();
    } catch (e) {
      console.log("LinkedIn optimize error:", e);
      Alert.alert(
        isTurkish ? "Hata" : "Error",
        isTurkish
          ? "LinkedIn metni optimize edilirken bir hata oluştu."
          : "Something went wrong while optimizing your LinkedIn text."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!optimizedText) return;
    await Clipboard.setStringAsync(optimizedText);
    Alert.alert(
      isTurkish ? "Kopyalandı" : "Copied",
      isTurkish
        ? "Metin panoya kopyalandı."
        : "Text copied to clipboard."
    );
  };

  const SectionToggle = () => (
    <View style={styles.toggleRow}>
      {[
        { key: "about", label: isTurkish ? "Hakkımda" : "About" },
        { key: "experience", label: isTurkish ? "Deneyim" : "Experience" },
      ].map((opt) => {
        const active = sectionType === opt.key;
        return (
          <TouchableOpacity key={opt.key} onPress={() => setSectionType(opt.key)} style={[ styles.toggleChip, { borderColor: active ? "#2563eb" : theme.border, backgroundColor: active ? "#1d4ed8" : theme.bgCard, }, ]} >
            <Text style={{ color: active ? "#fff" : theme.textSecondary, fontSize: 13, fontWeight: active ? "600" : "400", }} >
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.bg }]} >
      <Text style={[styles.title, { color: theme.textPrimary }]}>
        {isTurkish ? "LinkedIn Optimizasyonu" : "LinkedIn Optimization Tool"}
      </Text>

      <Text style={[styles.label, { color: theme.textSecondary }]}>
        {isTurkish ? "Bölüm türü:" : "Section type:"}
      </Text>
      <SectionToggle />

      <Text style={[styles.label, { color: theme.textSecondary }]}>
        {isTurkish
          ? "LinkedIn 'Hakkımda' veya deneyim açıklamanı buraya yapıştır:"
          : "Paste your LinkedIn About or Experience text here:"}
      </Text>

      <View style={{ position: "relative", marginBottom: 12 }}>
        <TextInput value={linkedInText} onChangeText={setLinkedInText} multiline textAlignVertical="top" maxLength={8000} placeholderTextColor="#6b7280"
          placeholder={ isTurkish ? "LinkedIn metnini buraya yapıştır..." : "Paste your LinkedIn section here..." } 
          style={[ styles.textArea, { backgroundColor: theme.bg, borderColor: theme.border, color: theme.textPrimary, paddingRight: 60, }, ]} />
        <Text style={styles.counter}>
          {linkedInText.length} / 8000
        </Text>
      </View>

      <Text style={[styles.label, { color: theme.textSecondary }]}>
        {isTurkish
          ? "Hedef rol (opsiyonel):"
          : "Target role (optional):"}
      </Text>

      <View style={{ position: "relative", marginBottom: 16 }}>
        <TextInput value={targetRole} onChangeText={setTargetRole} placeholderTextColor="#6b7280" maxLength={120}
          placeholder={ isTurkish ? "Ör: Kıdemli Salesforce Geliştiricisi" : "e.g. Senior Salesforce Developer" } 
          style={[ styles.input, { backgroundColor: theme.bg, borderColor: theme.border, color: theme.textPrimary, paddingRight: 40, }, ]} />
        <Text style={styles.counterSmall}>
          {targetRole.length} / 120
        </Text>
      </View>

      <TouchableOpacity style={[ styles.button, { backgroundColor: "#2563eb", opacity: loading ? 0.7 : 1 }, ]} onPress={handleOptimize} disabled={loading} >
        {loading ? ( <ActivityIndicator color="#fff" /> ) : (
          <Text style={styles.buttonText}>
            {isTurkish ? "LinkedIn metnimi optimize et" : "Optimize my LinkedIn section"}
          </Text>
        )}
      </TouchableOpacity>

      {optimizedText ? (
        <View style={[ styles.resultCard, { borderColor: theme.border, backgroundColor: theme.bgCard }, ]} >
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            {isTurkish ? "Önerilen metin:" : "Optimized version:"}
          </Text>
          <Text style={{ color: theme.textPrimary, marginTop: 4 }}>
            {optimizedText}
          </Text>

          <TouchableOpacity onPress={handleCopy} style={styles.copyButton}>
            <Text style={styles.copyButtonText}>
              {isTurkish ? "Metni kopyala" : "Copy text"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  textArea: {
    minHeight: 150,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  counter: {
    position: "absolute",
    right: 10,
    bottom: 8,
    fontSize: 11,
    color: "#9ca3af",
  },
  counterSmall: {
    position: "absolute",
    right: 10,
    bottom: 8,
    fontSize: 11,
    color: "#9ca3af",
  },
  button: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  toggleRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  toggleChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  resultCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  copyButton: {
    alignSelf: "flex-end",
    marginTop: 10,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#2563eb",
  },
  copyButtonText: {
    fontSize: 12,
    color: "#2563eb",
    fontWeight: "600",
  },
});