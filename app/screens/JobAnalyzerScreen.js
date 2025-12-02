import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, } from "react-native";
import { useAppContext } from "../context/AppContext";
import { analyzeJobDescription } from "../utils/api";

export default function JobAnalyzerScreen() {
  const { theme, canUseFeature, consumeCredit } = useAppContext();

  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const isTurkish = false; // later you can wire this from settings/context

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      Alert.alert(
        isTurkish ? "Uyarı" : "Warning",
        isTurkish
          ? "Lütfen iş ilanı metnini yaz veya yapıştır."
          : "Please paste the job description first."
      );
      return;
    }

    if (jobDescription.length > 20000) {
      Alert.alert(
        isTurkish ? "Uyarı" : "Warning",
        isTurkish
          ? "İlan metni çok uzun (en fazla 20.000 karakter)."
          : "Job description is too long (max 20,000 characters)."
      );
      return;
    }

    if (resumeText && resumeText.length > 20000) {
      Alert.alert(
        isTurkish ? "Uyarı" : "Warning",
        isTurkish
          ? "CV metni çok uzun (en fazla 20.000 karakter)."
          : "Resume text is too long (max 20,000 characters)."
      );
      return;
    }

    if (!canUseFeature()) return;

    try {
      setLoading(true);
      setResult(null);

      const language = isTurkish ? "tr" : "en";

      const data = await analyzeJobDescription({
        jobDescription,
        resumeText: resumeText || "",
        language,
      });

      setResult(data);
      consumeCredit();
    } catch (e) {
      console.log("Job analysis error:", e);
      Alert.alert(
        isTurkish ? "Hata" : "Error",
        isTurkish
          ? "İlan analizi sırasında bir hata oluştu."
          : "Something went wrong while analyzing the job description."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderList = (label, items) => {
    if (!items || !items.length) return null;
    return (
      <View style={[styles.card, { borderColor: theme.border, backgroundColor: theme.bgCard }]}>
        <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
          {label}
        </Text>
        {items.map((item, idx) => (
          <Text key={idx} style={[styles.cardItem, { color: theme.textSecondary }]} >
            • {item}
          </Text>
        ))}
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.bg }]} >
      <Text style={[styles.title, { color: theme.textPrimary }]}>
        {isTurkish ? "İş İlanı Analizi" : "Job Description Analyzer"}
      </Text>

      <Text style={[styles.label, { color: theme.textSecondary }]}>
        {isTurkish ? "İş ilanı metnini buraya yapıştır:" : "Paste the full job description here:"}
      </Text>

      <View style={{ position: "relative", marginBottom: 12 }}>
        <TextInput value={jobDescription} onChangeText={setJobDescription} placeholderTextColor="#6b7280" multiline textAlignVertical="top" maxLength={20000}
          placeholder={ isTurkish ? "İlan metnini buraya yapıştır..." : "Paste the job description here..." }
          style={[ styles.textArea, { backgroundColor: theme.bg, borderColor: theme.border, color: theme.textPrimary, paddingRight: 60, }, ]} />
        <Text style={styles.counter}>
          {jobDescription.length} / 20000
        </Text>
      </View>

      <Text style={[styles.label, { color: theme.textSecondary }]}>
        {isTurkish ? "CV metni (opsiyonel - eşleşme analizi için):"  : "Resume text (optional, for match analysis):"}
      </Text>

      <View style={{ position: "relative", marginBottom: 16 }}>
        <TextInput value={resumeText} onChangeText={setResumeText} multiline textAlignVertical="top" maxLength={20000} placeholderTextColor="#6b7280"
          placeholder={ isTurkish ? "CV'ni buraya yapıştır (opsiyonel)..." : "Paste your resume here (optional)..." }
          style={[ styles.textAreaSmall, { backgroundColor: theme.bg, borderColor: theme.border, color: theme.textPrimary, paddingRight: 60, }, ]} />
        <Text style={styles.counter}>
          {resumeText.length} / 20000
        </Text>
      </View>

      <TouchableOpacity style={[ styles.button, { backgroundColor: "#2563eb", opacity: loading ? 0.7 : 1 }, ]} onPress={handleAnalyze} disabled={loading} >
        {loading ? ( <ActivityIndicator color="#fff" /> ) : (
          <Text style={styles.buttonText}>
            {isTurkish ? "Analiz et" : "Analyze Job Description"}
          </Text>
        )}
      </TouchableOpacity>

      {/* RESULTS */}
      {result && (
        <View style={{ marginTop: 20 }}>
          {/* Basic info */}
          <View style={[ styles.card, { borderColor: theme.border, backgroundColor: theme.bgCard }, ]}  >
            {result.roleTitle ? (
              <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
                {result.roleTitle}
              </Text>
            ) : null}
            {result.seniority ? (
              <Text style={{ color: theme.textSecondary, marginBottom: 6 }}>
                {isTurkish ? "Kıdem seviyesi: " : "Seniority: "}
                <Text style={{ fontWeight: "600" }}>{result.seniority}</Text>
              </Text>
            ) : null}
            {result.jobSummary ? (
              <Text style={{ color: theme.textSecondary }}>
                {result.jobSummary}
              </Text>
            ) : null}
            {result.source && (
              <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 8, }} >
                Source: {result.source}
              </Text>
            )}
          </View>

          {renderList(
            isTurkish ? "Teknik/Yetenek (Hard skills)" : "Hard skills",
            result.hardSkills
          )}
          {renderList(
            isTurkish ? "Davranışsal (Soft skills)" : "Soft skills",
            result.softSkills
          )}
          {renderList(
            isTurkish ? "Araçlar ve Teknolojiler" : "Tools & Technologies",
            result.tools
          )}
          {renderList(
            isTurkish ? "Anahtar kelimeler" : "Keywords",
            result.keywords
          )}
          {renderList(
            isTurkish ? "Riskler / Soru İşaretleri" : "Red flags / Risks",
            result.redFlags
          )}
          {renderList(
            isTurkish ? "CV için öneriler" : "Recommended resume tweaks",
            result.recommendedResumeTweaks
          )}

          {result.matchSummary ? (
            <View style={[ styles.card, { borderColor: theme.border, backgroundColor: theme.bgCard }, ]} >
              <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
                {isTurkish ? "Eşleşme Özeti" : "Match summary"}
              </Text>
              <Text style={{ color: theme.textSecondary }}>
                {result.matchSummary}
              </Text>
            </View>
          ) : null}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
    flex: 1
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
    minHeight: 160,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
  },
  textAreaSmall: {
    minHeight: 100,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
  },
  counter: {
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
    marginTop: 4,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  card: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  cardTitle: {
    fontWeight: "700",
    marginBottom: 6,
  },
  cardItem: {
    fontSize: 13,
    marginBottom: 3,
  },
});