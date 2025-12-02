// app/screens/BulletRewriterScreen.js
import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Platform,} from "react-native";
import * as Clipboard from "expo-clipboard";
import { useAppContext } from "../context/AppContext";
import { rewriteBullet } from "../utils/api";

export default function BulletRewriterScreen({ navigation }) {
  const { canUseFeature, consumeCredit, theme } = useAppContext();

  const [bullet, setBullet] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [tone, setTone] = useState("impact"); // "impact" | "leadership" | "concise"
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const isTurkish = false; // or from context/settings if you have it

  const handleRewrite = async () => {
    if (!bullet.trim()) {
      Alert.alert(
        isTurkish ? "Uyarı" : "Warning",
        isTurkish ? "Lütfen maddeyi yaz." : "Please enter a bullet point first." );
      return;
    }

    if (bullet.length > 500) {
      Alert.alert(
        isTurkish ? "Uyarı" : "Warning",
        isTurkish ? "Madde çok uzun. En fazla 500 karakter olmalı." : "Bullet is too long. Max 500 characters." );
      return;
    }

    if (!canUseFeature()) return;

    try {
      setLoading(true);
      setSuggestions([]);

      const language = isTurkish ? "tr" : "en";
      const data = await rewriteBullet({ bulletText: bullet, targetRole, language, tone, });

      if (!data || !data.suggestions) {
        throw new Error("Missing suggestions in response");
      }

      setSuggestions(data.suggestions);
      consumeCredit();
    } catch (e) {
      console.log("Bullet rewrite error:", e);
      Alert.alert(
        isTurkish ? "Hata" : "Error",
        isTurkish ? "Öneriler alınırken bir hata oluştu." : "Something went wrong while generating suggestions." );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text) => {
    await Clipboard.setStringAsync(text);
    Alert.alert(
      isTurkish ? "Kopyalandı" : "Copied",
      isTurkish ? "Metin panoya kopyalandı." : "Text copied to clipboard." );
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.bg }]} >
      <Text style={[styles.title, { color: theme.textPrimary }]}>
        {isTurkish ? "Madde Yenileyici" : "Bullet Point Rewriter"}
      </Text>

      <Text style={[styles.label, { color: theme.textSecondary }]}>
        {isTurkish ? "Mevcut maddeyi yaz veya yapıştır:" : "Type or paste your existing bullet:"}
      </Text>

      <View style={{ position: "relative" }}>
        <TextInput value={bullet} onChangeText={setBullet} maxLength={500} multiline textAlignVertical="top" placeholderTextColor="#6b7280"
          placeholder={ isTurkish ? "Ör: Müşteri memnuniyetini artırmak için süreçleri iyileştirdim..." : 'e.g. Improved processes to increase customer satisfaction...' } 
          style={[ styles.textArea, { backgroundColor: theme.bg, borderColor: theme.border, color: theme.textPrimary, paddingRight: 50, }, ]} />
        {/* Inline counter */}
        <Text style={styles.counter}>
          {bullet.length} / 500
        </Text>
      </View>

      {/* Target Role */}
      <Text style={[styles.label, { color: theme.textSecondary }]}>
        {isTurkish ? "Hedef pozisyon (opsiyonel):" : "Target role (optional):"}
      </Text>
      <View style={{ position: "relative", marginBottom: 12 }}>
        <TextInput value={targetRole} onChangeText={setTargetRole} placeholderTextColor="#6b7280" maxLength={100}
          placeholder={ isTurkish ? "Ör: Kıdemli Salesforce Geliştiricisi" : "e.g. Senior Salesforce Developer" }
          style={[ styles.input, { backgroundColor: theme.bg, borderColor: theme.border, color: theme.textPrimary, paddingRight: 40, }, ]} />
        <Text style={styles.counterSmall}>
          {targetRole.length} / 100
        </Text>
      </View>

      {/* Tone selector – very simple */}
      <Text style={[styles.label, { color: theme.textSecondary }]}>
        {isTurkish ? "Ton:" : "Tone:"}
      </Text>
      <View style={styles.toneRow}>
        {[
          { key: "impact", label: isTurkish ? "Etkili" : "Impactful" },
          { key: "leadership", label: isTurkish ? "Liderlik" : "Leadership" },
          { key: "concise", label: isTurkish ? "Kısa" : "Concise" },
        ].map((t) => {
          const active = tone === t.key;
          return (
            <TouchableOpacity key={t.key} onPress={() => setTone(t.key)}
              style={[ styles.toneChip, { borderColor: active ? "#2563eb" : theme.border, backgroundColor: active ? "#1d4ed8" : theme.bgCard, }, ]} >
              <Text style={{ color: active ? "#fff" : theme.textSecondary, fontSize: 13, }} >
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={[ styles.button, { backgroundColor: "#2563eb", opacity: loading ? 0.7 : 1 }, ]} onPress={handleRewrite} disabled={loading} >
        {loading ? ( <ActivityIndicator color="#fff" /> ) : (
          <Text style={styles.buttonText}>
            {isTurkish ? "Öneriler oluştur" : "Generate Suggestions"}
          </Text>
        )}
      </TouchableOpacity>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <View style={{ marginTop: 16 }}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            {isTurkish ? "Önerilen maddeler:" : "Suggested bullets:"}
          </Text>
          {suggestions.map((s, idx) => (
            <View key={idx} style={[ styles.suggestionCard, { backgroundColor: theme.bgCard, borderColor: theme.border }, ]} >
              <Text style={{ color: theme.textPrimary, marginBottom: 8 }}>
                {s}
              </Text>
              <TouchableOpacity onPress={() => handleCopy(s)} style={styles.copyButton} >
                <Text style={styles.copyButtonText}>
                  {isTurkish ? "Kopyala" : "Copy"}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
    flex:1
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
    minHeight: 120,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    marginBottom: 12,
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
  toneRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
    marginTop: 4,
  },
  toneChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
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
  suggestionCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  copyButton: {
    alignSelf: "flex-end",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#2563eb",
  },
  copyButtonText: {
    fontSize: 12,
    color: "#2563eb",
  },
});