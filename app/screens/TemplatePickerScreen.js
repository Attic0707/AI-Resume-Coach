// app/screens/TemplatePickerScreen.js
import React, { useContext, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated } from "react-native";
import { AppContext } from "../context/AppContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PAGE_WIDTH = SCREEN_WIDTH * 0.75;      // A4 preview width
const PAGE_HEIGHT = PAGE_WIDTH * 1.414;      // A4 aspect ratio
const SPACING = 18;

const TEMPLATES = [
  {
    id: "minimalWhite",
    name: "Minimal White",
    tag: "Clean & Modern",
    description:
      "Bright two-column layout with strong typography. Perfect for accountants, consultants and corporate roles.",
  },
  {
    id: "classic",
    name: "Classic",
    tag: "Timeless",
    description: "Simple single-column layout with clear sections.",
  },
  {
    id: "creative",
    name: "Creative",
    tag: "Stand-out",
    description: "More visual emphasis for creative and design roles.",
  },
  {
    id: "stanfordChronological",
    name: "Chronological",
    tag: "Chronological",
    description: "Focus on correct chronological event structure.",
  },
  {
    id: "stanfordTechnical",
    name: "Technical",
    tag: "Technical",
    description: "Education-first layout with strong technical skills and projects emphasis.",
  },
];

// --- Minimal White A4-like page preview (inspired by your Canva link) ---
function MinimalWhitePreview() {
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

// Simple placeholder preview for non-primary templates
function SimplePlaceholderPreview({ name }) {
  return (
    <View style={styles.previewPageOuter}>
      <View style={styles.previewPlaceholderInner}>
        <Text style={styles.placeholderTitle}>{name}</Text>
        <Text style={styles.placeholderSubtitle}>Template preview placeholder</Text>
        <View style={styles.placeholderLine} />
        <Text style={styles.placeholderBody}>
          The final exported resume will follow this layout style with your own
          content and colors.
        </Text>
      </View>
    </View>
  );
}

export default function TemplatePickerScreen({ navigation }) {
  const { theme } = useContext(AppContext);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleSelect = (tpl) => {
    navigation.navigate("TemplateEditor", {
      templateId: tpl.id,
      templateName: tpl.name,
    });
  };

  const renderItem = ({ item, index }) => {
    const inputRange = [
      (index - 1) * (PAGE_WIDTH + SPACING),
      index * (PAGE_WIDTH + SPACING),
      (index + 1) * (PAGE_WIDTH + SPACING),
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: "clamp",
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.5, 1, 0.5],
      extrapolate: "clamp",
    });

    return (
      <View style={{ width: PAGE_WIDTH + SPACING }}>
        <Animated.View style={[styles.cardWrapper, { transform: [{ scale }], opacity }]}>
          {/* A4 page preview */}
          {item.id === "minimalWhite" ? (
            <MinimalWhitePreview />
          ) : (
            <SimplePlaceholderPreview name={item.name} />
          )}

          {/* Meta underneath */}
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
            {item.name}
          </Text>
          <Text style={[styles.cardTag, { color: theme.accent }]}>
            {item.tag}
          </Text>
          <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>
            {item.description}
          </Text>

          <TouchableOpacity
            style={[styles.useButton, { borderColor: theme.accent }]}
            activeOpacity={0.85}
            onPress={() => handleSelect(item)}
          >
            <Text style={[styles.useButtonText, { color: theme.accent }]}>
              Use this template
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Text style={[styles.title, { color: theme.textPrimary }]}>
        Choose a template style
      </Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Swipe between A4 previews and pick the layout you like. You’ll customize
        all details on the next screen.
      </Text>

      <Animated.FlatList
        data={TEMPLATES}
        horizontal
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        snapToInterval={PAGE_WIDTH + SPACING}
        decelerationRate="fast"
        bounces={false}
        contentContainerStyle={{
          paddingHorizontal: (SCREEN_WIDTH - PAGE_WIDTH) / 2,
          paddingTop: 12,
          paddingBottom: 30,
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 52 },
  title: { fontSize: 22, fontWeight: "700", marginHorizontal: 16, marginBottom: 4 },
  subtitle: {
    fontSize: 13,
    marginHorizontal: 16,
    marginBottom: 8,
  },

  cardWrapper: {
    alignItems: "center",
  },

  // A4 preview outer frame
  previewPageOuter: {
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.5)",
    backgroundColor: "#ffffff",
    overflow: "hidden",
    marginBottom: 10,
  },
  previewPageInner: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },

  // Minimal White specific
  mwHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 8,
  },
  mwName: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#111827",
  },
  mwRole: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  mwHeaderRight: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  mwHeaderRightText: {
    fontSize: 10,
    letterSpacing: 2,
    color: "#9ca3af",
  },
  mwDivider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 8,
  },
  mwBodyRow: {
    flex: 1,
    flexDirection: "row",
  },
  mwLeftCol: {
    flex: 0.95,
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: "#f3f4f6",
  },
  mwRightCol: {
    flex: 1.3,
    paddingLeft: 12,
  },
  mwSectionBlock: {
    marginBottom: 10,
  },
  mwSectionTitle: {
    fontSize: 8,
    letterSpacing: 1,
    color: "#9ca3af",
    marginBottom: 4,
  },
  mwBodyText: {
    fontSize: 7,
    lineHeight: 16,
    color: "#374151",
  },
  mwSmallText: {
    fontSize: 7,
    lineHeight: 15,
    color: "#4b5563",
  },
  mwBulletGroup: {
    marginTop: 2,
  },
  mwExpItem: {
    marginBottom: 10,
  },
  mwExpLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  mwExpRole: {
    fontSize: 8,
    fontWeight: "600",
    color: "#111827",
  },
  mwExpCompany: {
    fontSize: 8,
    color: "#6b7280",
    marginBottom: 2,
  },
  mwExpDate: {
    fontSize: 8,
    color: "#9ca3af",
  },

  // Placeholder preview
  previewPlaceholderInner: {
    flex: 1,
    padding: 18,
    backgroundColor: "#f9fafb",
    justifyContent: "center",
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  placeholderSubtitle: {
    fontSize: 11,
    color: "#4b5563",
    marginBottom: 8,
  },
  placeholderLine: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginBottom: 8,
  },
  placeholderBody: {
    fontSize: 11,
    lineHeight: 17,
    color: "#6b7280",
  },

  // Meta under page
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 2,
  },
  cardTag: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 2,
  },
  cardDesc: {
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
    paddingHorizontal: 12,
  },
  useButton: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  useButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
