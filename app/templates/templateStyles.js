// app/templates/templateStyles.js
import { StyleSheet } from "react-native";

/**
 * Base preview styles (fallback / generic templates).
 * Dark-mode-ish preview card (not the main app theme).
 */
export const previewBaseStyles = StyleSheet.create({
  pvPage: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.5)",
    padding: 14,
    backgroundColor: "#020617",
  },
  pvHeaderClassic: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148,163,184,0.4)",
    paddingBottom: 6,
  },
  pvName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#e5e7eb",
  },
  pvHeadline: {
    fontSize: 13,
    color: "#9ca3af",
  },

  // Sections
  pvSection: {
    marginTop: 8,
  },
  pvSectionCompact: {
    marginTop: 6,
  },
  pvSectionTitle: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#9ca3af",
    marginBottom: 4,
  },
  pvSectionBody: {
    fontSize: 12,
    color: "#e5e7eb",
    lineHeight: 18,
  },

  // Contact block
  pvContactBlock: {
    marginTop: 4,
  },
  pvContactText: {
    fontSize: 11,
    color: "#9ca3af",
  },

  // Skill chips
  pvChipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  pvChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.7)",
    marginRight: 6,
    marginBottom: 6,
  },
  pvChipText: {
    fontSize: 11,
    color: "#e5e7eb",
  },
});

/**
 * Minimal White template styles – A4-style white page.
 */
export const minimalWhiteStyles = StyleSheet.create({
  mwPageOuter: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.4)",
    padding: 8,
    marginTop: 8,
    backgroundColor: "transparent",
    alignItems: "center",
  },
  mwPageInner: {
    width: "100%",
    aspectRatio: 0.707, // A4 portrait: width / height ≈ 0.707
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },

  // Header
  mwHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  mwPhoto: {
    width: 64,
    height: 64,
    borderRadius: 999,
    marginRight: 14,
  },
  mwPhotoPreviewPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 999,
    marginRight: 14,
    borderWidth: 1,
    borderColor: "#d4d4d8",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },
  mwPhotoInitials: {
    fontSize: 18,
    fontWeight: "700",
    color: "#52525b",
  },
  mwName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  mwRole: {
    fontSize: 13,
    color: "#4b5563",
    marginTop: 2,
  },
  mwHeaderRight: {
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  mwHeaderRightText: {
    fontSize: 10,
    letterSpacing: 4,
    color: "#9ca3af",
  },

  mwDivider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginBottom: 10,
  },

  // Body
  mwBodyRow: {
    flex: 1,
    flexDirection: "row",
  },
  mwLeftCol: {
    flex: 0.9,
    paddingRight: 14,
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
  },
  mwRightCol: {
    flex: 1.1,
    paddingLeft: 14,
  },

  mwSectionBlock: {
    marginBottom: 10,
  },
  mwSectionTitle: {
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#6b7280",
    marginBottom: 4,
  },
  mwBodyText: {
    fontSize: 11.5,
    lineHeight: 17,
    color: "#111827",
  },
  mwSmallText: {
    fontSize: 11,
    lineHeight: 16,
    color: "#374151",
  },
  mwBulletGroup: {
    marginTop: 2,
  },
});

/**
 * Stanford Chronological style
 */
export const stanfordChronologicalStyles = StyleSheet.create({
  scPageOuter: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.4)",
    padding: 8,
    marginTop: 8,
    alignItems: "center",
  },

  scPageInner: {
    width: "100%",
    aspectRatio: 0.707,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 26,
  },

  // HEADER
  scHeader: {
    alignItems: "center",
    marginBottom: 10,
  },
  scName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  scContactLine: {
    marginTop: 4,
    fontSize: 11,
    color: "#4b5563",
    textAlign: "center",
  },

  scDivider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 16,
  },

  // SECTION
  scSectionBlock: {
    marginBottom: 20,
  },
  scSectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#6b7280",
    marginBottom: 6,
  },

  // SUB-HEADER (company / school)
  scSubHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  scSubHeaderMain: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
    paddingRight: 12,
  },
  scDateText: {
    fontSize: 11,
    color: "#6b7280",
  },

  // BULLETS
  scBulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  scBullet: {
    fontSize: 10,
    marginRight: 6,
    marginTop: 3,
    color: "#111827",
  },
  scBulletText: {
    fontSize: 11,
    color: "#111827",
    lineHeight: 16,
    flex: 1,
  },

  // BODY TEXT
  scBodyText: {
    fontSize: 11,
    color: "#111827",
    lineHeight: 16,
  },
});

export const stanfordTechnicalStyles = StyleSheet.create({
stPageOuter: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: "rgba(148,163,184,0.5)",
      padding: 10,
      backgroundColor: "#020617",
  },
  stPageInner: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  stHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  stHeaderLeft: {
    flex: 1.2,
    paddingRight: 12,
  },
  stHeaderRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  stName: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.5,
    color: "#111827",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  stHeadline: {
    fontSize: 12,
    color: "#4b5563",
    fontWeight: "500",
  },
  stContactText: {
    fontSize: 10,
    color: "#4b5563",
  },
  stSummaryRow: {
    marginTop: 4,
    marginBottom: 6,
  },
  stSummaryText: {
    fontSize: 11,
    color: "#374151",
  },
  stDivider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 6,
  },

  // Sections
  stSection: {
    marginTop: 6,
  },
  stSectionTitle: {
    fontSize: 11,
    color: "#111827",
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  stIndentedBlock: {
    marginLeft: 4,
    marginTop: 1,
  },
  stBodyText: {
    fontSize: 10,
    color: "#111827",
    lineHeight: 14,
  },
  stBodyBold: {
    fontWeight: "700",
    fontSize: 10,
    color: "#111827",
  },
});