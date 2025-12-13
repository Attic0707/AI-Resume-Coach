import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

export default function MinimalWhiteTemplate({ data, photoUri }) {
  const {
    name,
    headline,
    summary,
    contact,
    experience,
    education,
    skills,
    projects,
    languages,
    expertise,
    certificates,
    publishes,
  } = data || {};

  const mainName = name?.trim() || "YOUR NAME";
  const mainHeadline = headline?.trim() || "Target Role / Headline";

  const contactLines = (contact || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const hasSkills = !!skills?.trim();

  return (
    <View style={styles.previewPageOuter}>
      <View style={styles.previewPageInner}>
        {/* Header */}
        <View style={styles.mwHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.mwName}>JOHN DOE</Text>
            <Text style={styles.mwRole}>Senior Accountant</Text>
          </View>
          <View style={styles.mwHeaderRight}>
            <Text style={styles.mwHeaderRightText}>RESUME</Text>
          </View>
        </View>

        <View style={styles.mwDivider} />

        {/* Two-column body */}
        <View style={styles.mwBodyRow}>
          {/* LEFT COLUMN */}
          <View style={styles.mwLeftCol}>
            {/* Contact */}
            <View style={styles.mwSectionBlock}>
              <Text style={styles.mwSectionTitle}>CONTACT</Text>
              <Text style={styles.mwSmallText}>john.doe@email.com</Text>
              <Text style={styles.mwSmallText}>+1 555 123 4567</Text>
              <Text style={styles.mwSmallText}>New York, NY</Text>
              <Text style={styles.mwSmallText}>linkedin.com/in/johndoe</Text>
            </View>

            {/* Profile */}
            <View style={styles.mwSectionBlock}>
              <Text style={styles.mwSectionTitle}>PROFILE</Text>
              <Text style={styles.mwBodyText}>
                Detail-oriented accountant with 7+ years of experience in
                financial reporting, tax compliance and process improvement
                across mid-size and enterprise organizations.
              </Text>
            </View>

            {/* Skills */}
            <View style={styles.mwSectionBlock}>
              <Text style={styles.mwSectionTitle}>SKILLS</Text>
              <View style={styles.mwBulletGroup}>
                <Text style={styles.mwSmallText}>• Financial analysis</Text>
                <Text style={styles.mwSmallText}>• Budgeting & forecasting</Text>
                <Text style={styles.mwSmallText}>• IFRS / GAAP</Text>
                <Text style={styles.mwSmallText}>• Excel & ERP tools</Text>
              </View>
            </View>
          </View>

          {/* RIGHT COLUMN */}
          <View style={styles.mwRightCol}>
            {/* Experience */}
            <View style={styles.mwSectionBlock}>
              <Text style={styles.mwSectionTitle}>EXPERIENCE</Text>

              <View style={styles.mwExpItem}>
                <View style={styles.mwExpLine}>
                  <Text style={styles.mwExpRole}>Senior Accountant</Text>
                  <Text style={styles.mwExpDate}>2019 – Present</Text>
                </View>
                <Text style={styles.mwExpCompany}>Bright Ledger Consulting</Text>
                <Text style={styles.mwBodyText}>
                  • Led monthly close for 15+ client accounts.{"\n"}
                  • Reduced reporting errors by 23% through process audits.{"\n"}
                  • Partnered with leadership to define quarterly KPIs.
                </Text>
              </View>

              <View style={styles.mwExpItem}>
                <View style={styles.mwExpLine}>
                  <Text style={styles.mwExpRole}>Accountant</Text>
                  <Text style={styles.mwExpDate}>2016 – 2019</Text>
                </View>
                <Text style={styles.mwExpCompany}>Northstone Group</Text>
                <Text style={styles.mwBodyText}>
                  • Prepared financial statements and tax filings.{"\n"}
                  • Supported annual audits and variance analysis.
                </Text>
              </View>
            </View>

            {/* Education */}
            <View style={styles.mwSectionBlock}>
              <Text style={styles.mwSectionTitle}>EDUCATION</Text>
              <Text style={styles.mwBodyText}>
                BSc Accounting – University of Example{"\n"}
                2012 – 2016
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

function Block({ title, children }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  // White A4 vibe
  pageOuter: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.12)",
    overflow: "hidden",
  },
  pageInner: { padding: 14 },

  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  photo: { width: 52, height: 52, borderRadius: 10 },
  photoPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: "rgba(17,24,39,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  photoInitials: { fontWeight: "800", color: "#111827" },

  name: { fontSize: 18, fontWeight: "800", color: "#111827" },
  role: { fontSize: 12, color: "#374151", marginTop: 2 },

  headerRight: { paddingLeft: 8 },
  headerRightText: { fontSize: 10, letterSpacing: 2, color: "#6b7280" },

  divider: { height: 1, backgroundColor: "rgba(17,24,39,0.10)", marginVertical: 10 },

  bodyRow: { flexDirection: "row", gap: 14 },
  leftCol: { flex: 0.9 },
  rightCol: { flex: 1.4 },

  sectionTitle: { fontSize: 10, letterSpacing: 1.5, color: "#6b7280", marginBottom: 6 },
  bodyText: { fontSize: 11.5, lineHeight: 16.5, color: "#111827" },
  smallText: { fontSize: 11, lineHeight: 16, color: "#111827" },
});
