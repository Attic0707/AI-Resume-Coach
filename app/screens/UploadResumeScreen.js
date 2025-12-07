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
  const { theme } = useContext(AppContext);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

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
      Alert.alert("Error", "Could not open the file picker.");
    }
  };

  const uploadFile = async () => {
    if (!file) {
      Alert.alert("No file", "Please select a resume file first.");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        name: file.name || "resume.pdf",
        type:
          file.mimeType ||
          "application/octet-stream",
      });

      const response = await fetch(
        "https://resume-iq-2p17.onrender.com/api/upload-resume",
        {
          method: "POST",
          headers: {
            // DO NOT set Content-Type here, let fetch set the correct multipart boundary
            // "Content-Type": "multipart/form-data",
          },
          body: formData,
        }
      );

      if (!response.ok) {
        console.log("upload error status", response.status);
        throw new Error("Upload failed");
      }

      const data = await response.json();
      // Expected structure from backend:
      // { title, sections: [{ key, label, value }], meta?: {...} }

      if (!data.sections || !Array.isArray(data.sections)) {
        throw new Error("Invalid response from server");
      }

      // Navigate to editor with parsed data
      navigation.replace("ResumeEditor", {
        mode: "upload",
        initialTitle: data.title || "Imported Resume",
        initialSections: data.sections,
        sourceFileName: file.name,
      });
    } catch (e) {
      console.log("upload error", e);
      Alert.alert(
        "Upload failed",
        "We couldn't process this file. Please try a different PDF/DOCX or try again later."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Upload Resume
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <Text style={[styles.subtitle, { color: theme.mutedText }]}>
        Upload a PDF or Word file. We’ll analyze it and convert it into editable
        sections in the editor.
      </Text>

      <TouchableOpacity
        style={[
          styles.selectButton,
          {
            borderColor: theme.border,
            backgroundColor: theme.cardBackgroundSoft,
          },
        ]}
        onPress={pickFile}
      >
        <Text style={[styles.selectText, { color: theme.text }]}>
          {file ? "Change file" : "Choose file"}
        </Text>
        {file && (
          <Text style={[styles.fileName, { color: theme.mutedText }]}>
            {file.name}
          </Text>
        )}
      </TouchableOpacity>

      <View style={styles.hintBox}>
        <Text style={[styles.hintTitle, { color: theme.text }]}>
          Tips for best results
        </Text>
        <Text style={[styles.hintText, { color: theme.mutedText }]}>
          • Use a text-based PDF or DOCX (not a scanned image).
        </Text>
        <Text style={[styles.hintText, { color: theme.mutedText }]}>
          • Make sure your sections are labeled like “Experience”, “Education”,
          etc.
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.uploadButton,
            {
              backgroundColor: file ? theme.accent : theme.disabled,
              opacity: uploading ? 0.7 : 1,
            },
          ]}
          disabled={!file || uploading}
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
              Upload & Continue
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 52 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  backText: { fontSize: 14 },
  headerTitle: { fontSize: 18, fontWeight: "600" },
  subtitle: { fontSize: 13, marginBottom: 24 },
  selectButton: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  selectText: { fontSize: 15, fontWeight: "500", marginBottom: 6 },
  fileName: { fontSize: 12 },
  hintBox: {
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.4)",
  },
  hintTitle: { fontSize: 13, fontWeight: "600", marginBottom: 4 },
  hintText: { fontSize: 12 },
  footer: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 24,
  },
  uploadButton: {
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
  },
  uploadText: { fontSize: 15, fontWeight: "600" },
});
