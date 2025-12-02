// app/styles.js
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  // Welcome
  welcomeContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    bottom: 10
  },
  appTitle: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  appSubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  primaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 999,
  },
  primaryButtonText: {
    fontWeight: "600",
    fontSize: 16,
  },
  background: { 
    flex: 1
  },
  shineOverlay: {
    position: "absolute",
    top: -40,
    left: -80,
    width: 120,
    height: 340,
    backgroundColor: "rgba(255, 255, 255, 0.35)",
    borderRadius: 60,
  },
  circleButton: {
    width: 300,
    height: 70,
    borderRadius: 130,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 12,
    overflow: "hidden",
  },
  centerWrapper: {
    position: "absolute",
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  circleText: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 30,
  },

  // Home
  homeContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  homeTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  homeSubtitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  cardList: {
    paddingBottom: 24,
  },

  // Card
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  cardTextWrapper: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  iconImage: {
    width: "100%",
    height: "100%",
  },

  // Shared sections
  optimizeContainer: {
    flex: 1,
  },
  optimizeScroll: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginBottom: 16,
  },
  languageToggleWrapper: {
    flexDirection: "row",
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#1f2937",
    marginBottom: 16,
    overflow: "hidden",
  },
  languageButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: "transparent",
  },
  languageButtonActive: {
    backgroundColor: "#111827",
  },
  languageButtonText: {
    color: "#9ca3af",
    fontSize: 13,
    fontWeight: "500",
  },
  languageButtonTextActive: {
    color: "#e5e7eb",
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 4,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 12,
  },
  textArea: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    minHeight: 160,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 4,
    marginBottom: 16,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: "500",
  },
  primaryButtonWide: {
    flex: 1.4,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  resultBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
  },
  resultText: {
    fontSize: 13,
  },

  // Interview coach
  coachChipRow: {
    flexDirection: "row",
    marginBottom: 8,
    marginTop: 4,
  },
  coachChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
  },
  coachChipText: {
    fontSize: 12,
  },
  coachQuestionBox: {
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  coachProgressText: {
    fontSize: 12,
    marginBottom: 4,
  },
  coachQuestionText: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  coachAnswerInput: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    minHeight: 120,
    marginTop: 4,
  },
  coachChipActive: {
    backgroundColor: "#0f172a",
  },

  // Documents
  docItem: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
  },
  docItemHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  docTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  docMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  docDeleteButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  docDeleteText: {
    color: "#f97373",
    fontSize: 16,
  },
  docContentBox: {
    marginTop: 8,
  },
});

export default styles;
