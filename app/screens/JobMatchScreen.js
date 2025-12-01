// app/screens/JobMatchScreen.js
import React, { useContext, useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, } from "react-native";

import { AppContext, ProBadge, UsageBanner, saveDocument } from "../context/AppContext";
import styles from "../styles";
import { jobMatchResume } from "../utils/api";
import { generateCoverLetter } from "../utils/api";

export default function JobMatchScreen({ navigation }) {
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

  const handleSaveJobMatch = async () => {
    if (!tailoredResume || !tailoredResume.trim()) {
      Alert.alert("Nothing to save", "Generate a tailored resume first.");
      return;
    }

    // Try to guess a short job title from the first line of job description
    let jobTitle = "";
    if (jobDescription && jobDescription.trim()) {
      const firstLine = jobDescription.split("\n")[0].trim();
      jobTitle =
        firstLine.length > 50
          ? firstLine.slice(0, 50) + "…"
          : firstLine;
    }

    const title =
      jobTitle && jobTitle.length > 0
        ? `Tailored Resume – ${jobTitle}`
        : "Tailored Resume";

    await saveDocument({
      title,
      type: "job-match",
      content: tailoredResume,
    });

    Alert.alert("Saved", "Your tailored resume was saved to My Documents.");
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

  const handleSaveCoverLetter = async () => {
    if (!coverLetter || !coverLetter.trim()) {
      Alert.alert(
        isTurkish ? "Bilgi" : "Info",
        isTurkish
          ? "Önce ön yazıyı oluştur."
          : "Generate a cover letter first."
      );
      return;
    }

    let company = "";

    if (jobDescription && jobDescription.trim()) {
      const firstLine = jobDescription.split("\n")[0];
      const match = firstLine.match(/at\s+(.+)/i);
      if (match && match[1]) {
        company = match[1].trim();
      }
    }

    const title =
      company && company.length > 0
        ? `Cover Letter – ${company}`
        : "Cover Letter";

    await saveDocument({
      title,
      type: "cover-letter",
      content: coverLetter,
    });

    Alert.alert("Saved", "Your cover letter was saved to My Documents.");

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
              onPress={handleSaveJobMatch}
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