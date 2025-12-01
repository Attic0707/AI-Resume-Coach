// app/screens/OptimizeResumeScreen.js
import React, { useContext, useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, } from "react-native";

import { AppContext, ProBadge, UsageBanner, saveDocument } from "../context/AppContext";
import styles from "../styles";
import { optimizeResume } from "../utils/api";

export default function OptimizeResumeScreen({ navigation }) {
  const { theme, isPro, freeCreditsLeft, consumeCredit,  } = useContext(AppContext);
  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [language, setLanguage] = useState("en"); // 'en' or 'tr'
  const [optimizedText, setOptimizedText] = useState("");
  const [loading, setLoading] = useState(false);
  const isTurkish = language === "tr";
  const disclaimer = language === "tr" ? "*AI tarafından üretilmiştir. Lütfen başvurmadan önce gözden geçirin." : "*AI-generated. Please review before using in applications.";

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
      Alert.alert( "Limit reached",  "You’ve used all free credits. Upgrade to Pro for unlimited access.",
        [ { text: "Cancel", style: "cancel" }, { text: "Upgrade", onPress: () => navigation.navigate("Upgrade")}]);
      return false;
    }
    consumeCredit();
    return true;
  };
  
  const handleRewrite = async () => {
    if (!resumeText.trim()) {
      Alert.alert( language === "tr" ? "Uyarı" : "Warning", language === "tr" ? "Lütfen CV metninizi girin." : "Please paste your resume text first.");
      return;
    }
  
    if (typeof checkPaywall === "function") {
      if (!checkPaywall()) return;
    }
  
    setLoading(true);
    setOptimizedText("");
    
    try {
      const data = await optimizeResume({ resumeText, targetRole, language });

      if (!data || !data.optimizedText) {
        throw new Error("Missing optimizedText in response");
      }

      setOptimizedText(data.optimizedText);

      // (Optional) if you wanna debug where it came from:
      // console.log("Optimize source:", data.source);
    } catch (e) {
      console.log("Rewrite error:", e);
      Alert.alert( language === "tr" ? "Hata" : "Error", language === "tr" ? "CV yeniden yazılırken bir sorun oluştu." : "Something went wrong while rewriting your resume." );
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveOptimized = async () => {
    if (!optimizedText || !optimizedText.trim()) {
      Alert.alert("Nothing to save", "Generate a resume first.");
      return;
    }
  
    const rolePart = targetRole?.trim() ? ` – ${targetRole.trim()}`  : "";
  
    await saveDocument({ title: `Optimized Resume${rolePart}`, type: "resume", content: optimizedText });
    Alert.alert("Saved", "Your optimized resume was saved to My Documents.");
  };

  return (
    <View style={[ styles.optimizeContainer, { backgroundColor: theme.bg }, ]} >
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

        {/* Disclaimer */}
        <Text style={[ styles.sectionSubtitle, { color: theme.textSecondary }, ]}> 
          {disclaimer}
        </Text>

        {/* Language toggle */}
        <View style={styles.languageToggleWrapper}>
          <TouchableOpacity style={[ styles.languageButton, isTurkish && styles.languageButtonActive, ]} onPress={() => setLanguage("tr")}  >
            <Text style={[ styles.languageButtonText, isTurkish && styles.languageButtonTextActive, ]} >
              TR
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[ styles.languageButton, !isTurkish && styles.languageButtonActive, ]} onPress={() => setLanguage("en")}  >
            <Text style={[ styles.languageButtonText, !isTurkish && styles.languageButtonTextActive, ]} >
              EN
            </Text>
          </TouchableOpacity>
        </View>

        {/* Target role */}
        <Text style={[ styles.inputLabel, { color: theme.textPrimary } ]}  >
          {isTurkish ? "Hedef Pozisyon (opsiyonel)" : "Target Role (optional)"}
        </Text>

        <TextInput value={targetRole} onChangeText={setTargetRole}
          placeholder={ isTurkish ? "Ör: Kıdemli Salesforce Geliştiricisi" : "e.g. Senior Salesforce Developer" } placeholderTextColor="#6b7280"
          style={[ styles.input, { backgroundColor: theme.bg, borderColor: theme.border, color: theme.textPrimary, }, ]} />

        {/* Resume input */}
        <Text style={[ styles.inputLabel, { color: theme.textPrimary }, ]} >
          {isTurkish ? "Mevcut CV Metnin" : "Your Current Resume Text"}
        </Text>

        <TextInput value={resumeText} onChangeText={setResumeText}
          placeholder={ isTurkish ? "CV’ni buraya yapıştır veya yaz..." : "Paste or type your resume here..." }  placeholderTextColor="#6b7280"
          style={[ styles.textArea, { backgroundColor: theme.bg, borderColor: theme.border, color: theme.textPrimary, }, ]} multiline={true} textAlignVertical="top" />

        {/* Sample + Rewrite */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[ styles.secondaryButton, { borderColor: theme.border }, ]} onPress={handleUseSample} >
            <Text style={[ styles.secondaryButtonText, { color: theme.textPrimary }, ]} >
              {isTurkish ? "Örnek CV Kullan" : "Use Sample Resume"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[ styles.primaryButtonWide, { backgroundColor: theme.accent }, ]} onPress={handleRewrite} disabled={loading} >
            {loading ? (
              <ActivityIndicator color={theme.textOnAccent} />) : (
              <Text style={[ styles.primaryButtonText, { color: theme.textOnAccent }, ]} >
                {isTurkish ? "CV'yi Yeniden Yaz" : "Rewrite My Resume"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Result */}
        {optimizedText ? (
          <View style={[ styles.resultBox, { backgroundColor: theme.bgCard, borderColor: theme.border, },]} >
            <Text style={[ styles.resultTitle, { color: theme.textPrimary },]} >
              {isTurkish ? "Sonuç" : "Optimized Version"}
            </Text>
            <Text style={[ styles.resultText, { color: theme.textSecondary },]} >
              {optimizedText}
            </Text>

            <TouchableOpacity style={[ styles.secondaryButton, { marginTop: 10, borderColor: theme.border },]} onPress={handleSaveOptimized} >
              <Text style={[ styles.secondaryButtonText, { color: theme.textPrimary }, ]} >
                {isTurkish ? "Belgelerime Kaydet" : "Save to My Documents"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}