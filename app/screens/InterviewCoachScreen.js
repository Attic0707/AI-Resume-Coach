// app/screens/InterviewCoachScreen.js
import React, { useContext, useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, } from "react-native";

import { AppContext, ProBadge, UsageBanner } from "../context/AppContext";
import styles from "../styles";
import { getInterviewQuestions } from "../utils/api";
import { getInterviewFeedback } from "../utils/api";

export default function InterviewCoachScreen({ navigation }) {
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