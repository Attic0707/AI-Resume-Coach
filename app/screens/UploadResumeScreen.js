// app/screens/UploadResumeScreen.js
import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { AppContext } from "../context/AppContext";

export default function UploadResumeScreen({ navigation }) {
  const { theme, language } = useContext(AppContext);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const isTurkish = language === "tr";

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
          "application/msword", // doc
        ],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) {
        return;
      }

      const picked = result.assets?.[0];
      if (!picked) return;

      setFile(picked);
    } catch (e) {
      console.log("file pick error", e);
      Alert.alert(
        isTurkish ? "Hata" : "Error",
        isTurkish
          ? "Dosya seçici açılamadı."
          : "Could not open the file picker."
      );
    }
  };

  const uploadFile = async () => {
    if (!file) {
      Alert.alert(
        isTurkish ? "Dosya yok" : "No file",
        isTurkish
          ? "Lütfen önce bir CV dosyası seçin."
          : "Please select a resume file first."
      );
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        name: file.name || "resume.pdf",
        type: file.mimeType || "application/octet-stream",
      });

      const response = await fetch(
        "https://resume-iq-2p17.onrender.com/upload-resume",
        {
          method: "POST",
          headers: {
            // Let fetch set multipart boundary
          },
          body: formData,
        }
      );

      if (!response.ok) {
        console.log("upload error status", response.status);
        throw new Error("Upload failed");
      }

      const data = await response.json();
      // Expected: { title, sections: [{ key, label, value }], meta?: {...} }

      if (!data.sections || !Array.isArray(data.sections)) {
        throw new Error("Invalid response from server");
      }

      navigation.replace("ResumeEditor", {
        mode: "upload",
        initialTitle: data.title || "Imported Resume",
        initialSections: data.sections,
        sourceFileName: file.name,
        meta: data.meta || null,
        resumeId: data.resumeId,
      });
    } catch (e) {
      console.log("upload error", e);
      Alert.alert(
        isTurkish ? "Yükleme başarısız" : "Upload failed",
        isTurkish
          ? "Bu dosyayı işleyemedik. Lütfen başka bir PDF/DOCX deneyin veya daha sonra tekrar deneyin."
          : "We couldn't process this file. Please try a different PDF/DOCX or try again later."
      );
    } finally {
      setUploading(false);
    }
  };

  const canSubmit = !!file && !uploading;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text
          style={[
            styles.headerTitle,
            { color: theme.textPrimary },
          ]}
        >
          {isTurkish ? "CV Yükle" : "Upload Resume"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Context card */}
      <View
        style={[
          styles.contextCard,
          {
            backgroundColor: theme.bgCard,
            borderColor: theme.border,
          },
        ]}
      >
        <Text
          style={[
            styles.contextTitle,
            { color: theme.textPrimary },
          ]}
        >
          {isTurkish
            ? "PDF / Word dosyanı içeriye çeviriyoruz"
            : "Turn your PDF / Word into editable sections"}
        </Text>
        <Text
          style={[
            styles.contextSubtitle,
            { color: theme.textSecondary },
          ]}
        >
          {isTurkish
            ? "CV’ni yükle, biz de deneyim, eğitim, beceriler gibi bölümlere ayırıp düzenlenebilir hale getirelim."
            : "Upload your resume and we’ll break it into Experience, Education, Skills and other sections you can edit and improve with AI."}
        </Text>
      </View>

      {/* File selection card */}
      <TouchableOpacity
        activeOpacity={0.9}
        style={[
          styles.selectCard,
          {
            backgroundColor: theme.bgCard,
            borderColor: theme.border,
          },
        ]}
        onPress={pickFile}
      >
        <View style={styles.selectHeaderRow}>
          <Text
            style={[
              styles.selectTitle,
              { color: theme.textPrimary },
            ]}
          >
            {file
              ? isTurkish
                ? "Dosyayı değiştir"
                : "Change file"
              : isTurkish
              ? "Dosya seç"
              : "Choose file"}
          </Text>
          <Text style={{ fontSize: 22 }}>📄</Text>
        </View>

        <Text
          style={[
            styles.selectSubtitle,
            { color: theme.textSecondary },
          ]}
        >
          {isTurkish
            ? "Desteklenen formatlar: PDF, DOCX, DOC"
            : "Supported formats: PDF, DOCX, DOC"}
        </Text>

        {file ? (
          <View style={styles.filePill}>
            <Text
              style={[
                styles.fileName,
                { color: theme.textPrimary },
              ]}
              numberOfLines={1}
            >
              {file.name}
            </Text>
          </View>
        ) : null}
      </TouchableOpacity>

      {/* Tips box */}
      <View
        style={[
          styles.hintBox,
          { borderColor: theme.border },
        ]}
      >
        <Text
          style={[
            styles.hintTitle,
            { color: theme.textPrimary },
          ]}
        >
          {isTurkish ? "En iyi sonuçlar için" : "Tips for best results"}
        </Text>
        <Text
          style={[
            styles.hintText,
            { color: theme.textSecondary },
          ]}
        >
          •{" "}
          {isTurkish
            ? "Metin tabanlı PDF veya DOCX kullan (tarama görüntüsü olmasın)."
            : "Use a text-based PDF or DOCX (not a scanned image)."}
        </Text>
        <Text
          style={[
            styles.hintText,
            { color: theme.textSecondary },
          ]}
        >
          •{" "}
          {isTurkish
            ? 'Bölümleri "Experience", "Education", "Skills" gibi başlıklarla ayırmaya çalış.'
            : 'Make sure your sections are labeled like “Experience”, “Education”, “Skills”, etc.'}
        </Text>
        <Text
          style={[
            styles.hintText,
            { color: theme.textSecondary },
          ]}
        >
          •{" "}
          {isTurkish
            ? "Dosya yüklendikten sonra tüm alanları düzenleyebilir ve AI ile iyileştirebilirsin."
            : "After upload, you can edit every section and enhance it with AI."}
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.uploadButton,
            {
              backgroundColor: canSubmit
                ? theme.accent
                : theme.border,
              opacity: uploading ? 0.7 : 1,
            },
          ]}
          disabled={!canSubmit}
          onPress={uploadFile}
        >
          {uploading ? (
            <ActivityIndicator color={theme.textOnAccent} />
          ) : (
            <Text
              style={[
                styles.uploadText,
                { color: theme.textOnAccent },
              ]}
            >
              {isTurkish
                ? "Yükle ve Devam Et"
                : "Upload & Continue"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 52 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: "600" },

  // Context card
  contextCard: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  contextTitle: { fontSize: 15, fontWeight: "600", marginBottom: 4 },
  contextSubtitle: { fontSize: 12, lineHeight: 18 },

  // File selection card
  selectCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  selectHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  selectTitle: { fontSize: 15, fontWeight: "600" },
  selectSubtitle: { fontSize: 12, marginBottom: 8 },
  filePill: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.5)",
    alignSelf: "flex-start",
    maxWidth: "100%",
  },
  fileName: { fontSize: 12 },

  // Tips box
  hintBox: {
    marginTop: 4,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  hintTitle: { fontSize: 13, fontWeight: "600", marginBottom: 4 },
  hintText: { fontSize: 12, marginBottom: 2 },

  // Footer
  footer: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
  },
  uploadButton: {
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadText: { fontSize: 15, fontWeight: "600" },
});
