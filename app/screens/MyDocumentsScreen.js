// app/screens/MyDocumentsScreen.js
import React, { useContext, useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, Platform, StyleSheet, Dimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { AppContext, DOCS_STORAGE_KEY, generateId, getTypeLabel, getTypeColor, formatDate } from "../context/AppContext";
import { renderTemplatePreview } from "../templates/renderTemplatePreview";
import { getTemplateById } from "../templates/templateRegistry";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const A4_WIDTH = Math.min(420, SCREEN_WIDTH - 32);
const A4_HEIGHT = A4_WIDTH * 1.414;

export default function MyDocumentsScreen({ navigation }) {
  const { theme } = useContext(AppContext);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedDoc, setSelectedDoc] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const raw = await AsyncStorage.getItem(DOCS_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      setDocuments(normalizeToNewDocs(parsed));
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
      if (typeof item === "string") {
        return {
          id: generateId(),
          title: "Untitled",
          type: "resume",
          createdAt: new Date().toISOString(),
          content: item,
          templateId: null,
          meta: null,
        };
      }
      return {
        id: item.id || generateId(),
        title: item.title || "Untitled",
        type: item.type || "resume",
        createdAt: item.createdAt || new Date().toISOString(),
        content: item.content || "",
        templateId: item.templateId || item?.meta?.templateId || null,
        meta: item.meta || null,
        updatedAt: item.updatedAt || null,
      };
    });
  };

  const persistDocs = async (nextDocs) => {
    setDocuments(nextDocs);
    try {
      await AsyncStorage.setItem(DOCS_STORAGE_KEY, JSON.stringify(nextDocs));
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
          { text: "Cancel", style: "cancel" },
          {
            text: "Save",
            onPress: (text) => {
              const newTitle = text?.trim();
              if (!newTitle) return;
              const next = documents.map((d) => (d.id === docId ? { ...d, title: newTitle } : d));
              persistDocs(next);
            },
          },
        ],
        "plain-text",
        doc.title
      );
    } else {
      Alert.alert("Rename not supported", "Inline rename is currently supported only on iOS.");
    }
  };

  const openPreview = (doc) => {
    setSelectedDoc(doc);
    setPreviewVisible(true);
  };

  const closePreview = () => {
    setSelectedDoc(null);
    setPreviewVisible(false);
  };

  const handleEdit = (doc) => {
    const tpl = getTemplateById(doc.templateId);
    navigation.navigate("TemplateEditor", {
      templateId: doc.templateId,
      templateName: tpl?.name || doc?.meta?.templateName || "Template",
      initialDocId: doc.id,
      initialTitle: doc.title,
      initialMeta: doc.meta || null,
    });
  };

  // Basic HTML export that resembles your templates
  const buildHtmlForExport = (doc) => {
    const data = doc?.meta?.previewData || {};
    const title = (doc.title || "Document").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const safe = (t = "") =>
      String(t)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br/>");

    const baseCss = `
      @page { size: A4; margin: 22mm; }
      body { font-family: -apple-system, system-ui, sans-serif; color:#111827; }
      .name { font-size: 22px; font-weight: 800; letter-spacing: .5px; }
      .headline { font-size: 12px; color:#6b7280; margin-top: 2px; }
      .row { display:flex; gap:18px; margin-top: 14px; }
      .colL { width: 34%; border-right:1px solid #f3f4f6; padding-right: 14px; }
      .colR { width: 66%; padding-left: 14px; }
      .secTitle { font-size: 10px; letter-spacing: 1.2px; color:#9ca3af; margin: 12px 0 6px; }
      .text { font-size: 11px; line-height: 1.5; color:#374151; }
      .chip { display:inline-block; border:1px solid #e5e7eb; padding:3px 8px; border-radius:999px; font-size:10px; margin:2px 4px 0 0; }
    `;

    const tId = doc.templateId;

    if (tId === "minimalWhite") {
      const skillChips = (data.skills || "")
        .split(/[,;•\n]+/g)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 16)
        .map((s) => `<span class="chip">${safe(s)}</span>`)
        .join("");

      return `
        <!doctype html>
        <html><head><meta charset="utf-8" /><title>${title}</title><style>${baseCss}</style></head>
        <body>
          <div class="name">${safe(data.name || "Your Name")}</div>
          <div class="headline">${safe(data.headline || "Target Role / Headline")}</div>

          <div class="row">
            <div class="colL">
              ${data.contact ? `<div class="secTitle">CONTACT</div><div class="text">${safe(data.contact)}</div>` : ""}
              ${data.summary ? `<div class="secTitle">PROFILE</div><div class="text">${safe(data.summary)}</div>` : ""}
              ${data.skills ? `<div class="secTitle">SKILLS</div><div>${skillChips}</div>` : ""}
              ${data.languages ? `<div class="secTitle">LANGUAGES</div><div class="text">${safe(data.languages)}</div>` : ""}
            </div>

            <div class="colR">
              ${data.experience ? `<div class="secTitle">EXPERIENCE</div><div class="text">${safe(data.experience)}</div>` : ""}
              ${data.projects ? `<div class="secTitle">PROJECTS</div><div class="text">${safe(data.projects)}</div>` : ""}
              ${data.education ? `<div class="secTitle">EDUCATION</div><div class="text">${safe(data.education)}</div>` : ""}
              ${data.certificates ? `<div class="secTitle">CERTIFICATES</div><div class="text">${safe(data.certificates)}</div>` : ""}
              ${data.publishes ? `<div class="secTitle">PUBLICATIONS & AWARDS</div><div class="text">${safe(data.publishes)}</div>` : ""}
            </div>
          </div>
        </body></html>
      `;
    }

    // fallback: export as readable A4 text
    return `
      <!doctype html>
      <html><head><meta charset="utf-8" /><title>${title}</title>
      <style>
        @page { size: A4; margin: 22mm; }
        body { font-family: -apple-system, system-ui, sans-serif; color:#111827; }
        h1 { font-size: 20px; margin: 0 0 10px; }
        pre { white-space: pre-wrap; font-size: 11px; line-height: 1.5; }
      </style></head>
      <body>
        <h1>${title}</h1>
        <pre>${safe(doc.content || JSON.stringify(data, null, 2))}</pre>
      </body></html>
    `;
  };

  const handleExportPDF = async (doc) => {
    try {
      const html = buildHtmlForExport(doc);
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: doc.title,
      });
    } catch (e) {
      console.log("PDF export error:", e);
      Alert.alert("Error", "Something went wrong while exporting the PDF.");
    }
  };

  const renderDocCard = (doc) => {
    const typeColor = getTypeColor(doc.type, theme);
    const hasTemplate = !!doc.templateId && !!doc.meta?.previewData;

    return (
      <View
        key={doc.id}
        style={[
          stylesLocal.card,
          { backgroundColor: theme.bgCard, borderColor: theme.border },
        ]}
      >
        <TouchableOpacity activeOpacity={0.9} onPress={() => openPreview(doc)}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: theme.textPrimary, fontSize: 16, fontWeight: "600", flex: 1, marginRight: 8 }} numberOfLines={1}>
              {doc.title}
            </Text>

            <View style={{ paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, backgroundColor: typeColor + "20", borderWidth: 1, borderColor: typeColor + "66" }}>
              <Text style={{ fontSize: 11, color: typeColor, fontWeight: "600" }}>
                {getTypeLabel(doc.type)}
              </Text>
            </View>
          </View>

          <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 6 }}>
            {formatDate(doc.createdAt)}
          </Text>

          <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 6 }}>
            {hasTemplate ? "Tap to preview (A4)" : "Legacy document (no template data)"}
          </Text>
        </TouchableOpacity>

        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-end", marginTop: 10, gap: 8 }}>
          <TouchableOpacity
            style={[stylesLocal.btn, { borderColor: theme.border }]}
            onPress={() => handleEdit(doc)}
            disabled={!hasTemplate}
          >
            <Text style={{ color: hasTemplate ? theme.textPrimary : theme.textSecondary, fontSize: 12 }}>
              Edit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[stylesLocal.btn, { borderColor: theme.border }]} onPress={() => handleRename(doc.id)}>
            <Text style={{ color: theme.textPrimary, fontSize: 12 }}>Rename</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[stylesLocal.btn, { borderColor: theme.border }]} onPress={() => handleExportPDF(doc)}>
            <Text style={{ color: theme.textPrimary, fontSize: 12 }}>Export</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[stylesLocal.btn, { borderColor: "#ef4444" }]} onPress={() => handleDelete(doc.id)}>
            <Text style={{ color: "#ef4444", fontSize: 12 }}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView contentContainerStyle={{ paddingTop: 52, paddingHorizontal: 16, paddingBottom: 24 }}>
        <Text style={{ fontSize: 22, fontWeight: "700", color: theme.textPrimary }}>
          My Documents
        </Text>
        <Text style={{ fontSize: 13, color: theme.textSecondary, marginTop: 6 }}>
          Tap a document to preview it exactly like the template picker.
        </Text>

        {loading ? (
          <View style={{ marginTop: 18 }}>
            <ActivityIndicator color={theme.textPrimary} />
          </View>
        ) : documents.length === 0 ? (
          <View style={{ marginTop: 32, alignItems: "center" }}>
            <Text style={{ color: theme.textSecondary, textAlign: "center", marginBottom: 8 }}>
              No documents yet.
            </Text>
            <Text style={{ color: theme.textSecondary, fontSize: 12, textAlign: "center" }}>
              Save resumes from the editor to see them here.
            </Text>
          </View>
        ) : (
          <View style={{ marginTop: 14 }}>
            {documents
              .slice()
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map(renderDocCard)}
          </View>
        )}
      </ScrollView>

      {/* FULL SCREEN PREVIEW */}
      <Modal visible={previewVisible && !!selectedDoc} animationType="slide" onRequestClose={closePreview}>
        <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
          <View style={{ paddingTop: 52, paddingHorizontal: 16, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: "#e5e7eb", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <TouchableOpacity onPress={closePreview}>
              <Text style={{ fontSize: 14, color: "#6b7280" }}>Close</Text>
            </TouchableOpacity>

            <Text style={{ fontSize: 16, fontWeight: "600", color: "#111827" }} numberOfLines={1}>
              {selectedDoc?.title || "Preview"}
            </Text>

            <View style={{ width: 50 }} />
          </View>

          <ScrollView contentContainerStyle={{ padding: 16, alignItems: "center", paddingBottom: 40 }}>
            {selectedDoc?.templateId && selectedDoc?.meta?.previewData ? (
              <View style={stylesLocal.a4Outer}>
                <View style={{ flex: 1 }}>
                  {renderTemplatePreview({
                    templateId: selectedDoc.templateId,
                    data: selectedDoc.meta.previewData,
                    photoUri: selectedDoc.meta.photoUri || null,
                  })}
                </View>
              </View>
            ) : (
              <Text style={{ color: "#111827" }}>
                This is a legacy document without template data.
              </Text>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const stylesLocal = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 16, padding: 12, marginBottom: 12 },
  btn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  a4Outer: {
    width: A4_WIDTH,
    height: A4_HEIGHT,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },
});
