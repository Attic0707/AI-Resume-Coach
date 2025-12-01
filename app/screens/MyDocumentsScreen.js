// app/screens/MyDocumentsScreen.js
import React, { useContext, useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, Platform,} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import {AppContext, DOCS_STORAGE_KEY, generateId, getTypeLabel, getTypeColor, formatDate,} from "../context/AppContext";
import styles from "../styles";

export default function MyDocumentsScreen() {
  const { theme } = useContext(AppContext);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const raw = await AsyncStorage.getItem(DOCS_STORAGE_KEY);

      if (!raw) {
        // Try to migrate from an older storage key if you had one before
        const legacy = await AsyncStorage.getItem("@resumeiq_docs");
        if (legacy) {
          const parsed = JSON.parse(legacy);
          const migrated = normalizeToNewDocs(parsed);
          setDocuments(migrated);
          await AsyncStorage.setItem( DOCS_STORAGE_KEY, JSON.stringify(migrated) );
        } else {
          setDocuments([]);
        }
        return;
      }

      const parsed = JSON.parse(raw);
      const normalized = normalizeToNewDocs(parsed);
      setDocuments(normalized);
    } catch (e) {
      console.log("loadDocuments error:", e);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const normalizeToNewDocs = (arr) => {
    if (!Array.isArray(arr)) return [];

    return arr.map((item) => {
      // Old format: maybe a plain string or { id, title, content }
      if (typeof item === "string") {
        return {
          id: generateId(),
          title: "Untitled",
          type: "resume",
          createdAt: Date.now(),
          content: item,
        };
      }
      return {
        id: item.id || generateId(),
        title: item.title || "Untitled",
        type: item.type || "resume",
        createdAt: item.createdAt || Date.now(),
        content: item.content || "",
      };
    });
  };

  const persistDocs = async (nextDocs) => {
    setDocuments(nextDocs);
    try {
      await AsyncStorage.setItem( DOCS_STORAGE_KEY, JSON.stringify(nextDocs) );
    } catch (e) {
      console.log("persistDocs error:", e);
    }
  };

  const handleDelete = (docId) => {
    const doc = documents.find((d) => d.id === docId);
    if (!doc) return;

    Alert.alert(
      "Delete document?",
      `Are you sure you want to delete "${doc.title}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const next = documents.filter((d) => d.id !== docId);
            persistDocs(next);
          },
        },
      ]
    );
  };

  const handleRename = (docId) => {
    const doc = documents.find((d) => d.id === docId);
    if (!doc) return;

    if (Platform.OS === "ios" && Alert.prompt) {
      Alert.prompt(
        "Rename document",
        "Enter a new title:",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Save",
            onPress: (text) => {
              const newTitle = text?.trim();
              if (!newTitle) return;
              const next = documents.map((d) =>
                d.id === docId ? { ...d, title: newTitle } : d
              );
              persistDocs(next);
            },
          },
        ],
        "plain-text",
        doc.title
      );
    } else {
      // Simple fallback: log or later add your own modal for Android
      Alert.alert(
        "Rename not supported",
        "Inline rename is currently supported only on iOS. You can implement a custom modal for Android later."
      );
    }
  };

  const openDocument = (doc) => {
    setSelectedDoc(doc);
    setModalVisible(true);
  };

  const closeDocument = () => {
    setSelectedDoc(null);
    setModalVisible(false);
  };

  const handleExportPDF = async (doc) => {
    try {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>${doc.title}</title>
            <style>
              body {
                font-family: -apple-system, system-ui, sans-serif;
                padding: 24px;
                color: #111827;
                line-height: 1.5;
              }
              h1 {
                font-size: 24px;
                margin-bottom: 8px;
              }
              .meta {
                font-size: 12px;
                color: #6b7280;
                margin-bottom: 16px;
              }
              pre {
                white-space: pre-wrap;
                font-family: -apple-system, system-ui, sans-serif;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <h1>${doc.title}</h1>
            <div class="meta">
              Type: ${getTypeLabel(doc.type)}<br/>
              Created: ${formatDate(doc.createdAt)}
            </div>
            <pre>${doc.content
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")}</pre>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: doc.title,
      });
    } catch (e) {
      console.log("PDF export error:", e);
      Alert.alert(
        "Error",
        "Something went wrong while exporting the PDF."
      );
    }
  };

  const renderDocCard = (doc) => {
    const snippet =
      doc.content.length > 140
        ? doc.content.slice(0, 140) + "..."
        : doc.content;

    const typeColor = getTypeColor(doc.type, theme);

    return (
      <View key={doc.id} style={[ styles.resultBox, { backgroundColor: theme.bgCard, borderColor: theme.border, marginBottom: 12, }, ]} >
        {/* Top row: title + type badge */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6, }} >
          <Text style={[ styles.resultTitle, { color: theme.textPrimary, flex: 1, marginRight: 8 }, ]} numberOfLines={1} >
            {doc.title}
          </Text>
          <View style={{ paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, backgroundColor: typeColor + "20", borderWidth: 1, borderColor: typeColor + "66", }} >
            <Text style={{ fontSize: 11, color: typeColor, fontWeight: "600", }} >
              {getTypeLabel(doc.type)}
            </Text>
          </View>
        </View>

        <Text style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 6, }} >
          {formatDate(doc.createdAt)}
        </Text>

        <Text style={[ styles.resultText, { color: theme.textSecondary, marginBottom: 10, }, ]} numberOfLines={3} >
          {snippet || "<Empty document>"}
        </Text>

        {/* Action buttons */}
        <View style={{ flexDirection: "row", justifyContent: "flex-end", }} >
          <TouchableOpacity style={[ styles.secondaryButton, { borderColor: theme.border, paddingHorizontal: 12, paddingVertical: 6, marginRight: 6, }, ]}
            onPress={() => openDocument(doc)} >
            <Text style={[ styles.secondaryButtonText, { color: theme.textPrimary, fontSize: 12 }, ]} >
              Open
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[ styles.secondaryButton, { borderColor: theme.border, paddingHorizontal: 12, paddingVertical: 6, marginRight: 6, }, ]}
            onPress={() => handleRename(doc.id)} >
            <Text style={[ styles.secondaryButtonText, { color: theme.textPrimary, fontSize: 12 }, ]} >
              Rename
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[ styles.secondaryButton, { borderColor: "#ef4444", paddingHorizontal: 12, paddingVertical: 6, }, ]} 
            onPress={() => handleDelete(doc.id)} >
            <Text style={[ styles.secondaryButtonText, { color: "#ef4444", fontSize: 12 }, ]} >
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[ styles.optimizeContainer, { backgroundColor: theme.bg }, ]} >
      <ScrollView contentContainerStyle={styles.optimizeScroll}>
        <Text style={[ styles.sectionTitle, { color: theme.textPrimary }, ]} >
          My Documents
        </Text>
        <Text style={[ styles.sectionSubtitle, { color: theme.textSecondary, marginBottom: 8 }, ]} >
          All your saved resumes, tailored versions, cover letters and interview notes in one place.
        </Text>

        {loading ? ( <ActivityIndicator color={theme.textPrimary} /> ) : documents.length === 0 ? (
          <View style={{ marginTop: 32, alignItems: "center", }} >
            <Text style={{ color: theme.textSecondary, textAlign: "center", marginBottom: 8, }} >
              No documents yet.
            </Text>
            <Text style={{ color: theme.textSecondary, fontSize: 12, textAlign: "center", }} >
              Save your optimized resumes, job matches or cover letters from other screens to see them here.
            </Text>
          </View>
        ) : (
          <View style={{ marginTop: 12 }}>
            {documents
              .slice()
              .sort((a, b) => b.createdAt - a.createdAt)
              .map(renderDocCard)}
          </View>
        )}
      </ScrollView>

      {/* Detail modal */}
      <Modal visible={modalVisible && !!selectedDoc} animationType="slide" onRequestClose={closeDocument} >
        <View style={{ flex: 1, backgroundColor: theme.bg, paddingTop: 48, paddingHorizontal: 16, }} >
          {selectedDoc && (
            <>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, }} >
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={{ fontSize: 20, fontWeight: "600", color: theme.textPrimary, }} numberOfLines={2} >
                    {selectedDoc.title}
                  </Text>
                  <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 4, }} >
                    {getTypeLabel(selectedDoc.type)} ·{" "}
                    {formatDate(selectedDoc.createdAt)}
                  </Text>
                </View>

                <TouchableOpacity style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: theme.border, marginRight: 8, }}
                  onPress={() => handleExportPDF(selectedDoc)}>
                  <Text style={{ fontSize: 12, color: theme.textPrimary, }} >
                    Export PDF
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: theme.border,  }}
                  onPress={closeDocument} >
                  <Text style={{ fontSize: 12, color: theme.textPrimary, }} >
                    Close
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}  >
                <Text style={{ color: theme.textPrimary, fontSize: 14, lineHeight: 20, }} >
                  {selectedDoc.content || "<Empty document>"}
                </Text>
              </ScrollView>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}