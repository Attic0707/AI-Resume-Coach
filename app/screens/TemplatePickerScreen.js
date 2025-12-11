// app/screens/TemplatePickerScreen.js
import React, { useContext, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Dimensions } from "react-native";
import { AppContext } from "../context/AppContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// A4 ratio is roughly 1 : 1.414 (width : height)
const PAGE_WIDTH = SCREEN_WIDTH * 0.78;
const PAGE_HEIGHT = PAGE_WIDTH * 1.414;
const ITEM_SPACING = 16;

const TEMPLATES = [
  {
    id: "classic",
    name: "Classic",
    tag: "Timeless",
  },
  {
    id: "traditional",
    name: "Traditional",
    tag: "Conservative",
  },
  {
    id: "professional",
    name: "Professional",
    tag: "Corporate",
  },
  {
    id: "clear",
    name: "Clear",
    tag: "Two-column",
  },
  {
    id: "creative",
    name: "Creative",
    tag: "Stand-out",
  },
];

export default function TemplatePickerScreen({ navigation }) {
  const { theme } = useContext(AppContext);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSelect = (tpl) => {
    navigation.navigate("TemplateEditor", {
      templateId: tpl.id,
      templateName: tpl.name,
    });
  };

  const onMomentumEnd = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (PAGE_WIDTH + ITEM_SPACING));
    setCurrentIndex(index);
  };

  const renderItem = ({ item, index }) => {
    const isActive = index === currentIndex;

    return (
      <View style={{ width: PAGE_WIDTH, marginRight: ITEM_SPACING, }} >
        <TouchableOpacity activeOpacity={0.9} onPress={() => handleSelect(item)}
          style={[ styles.pageOuter, { borderColor: isActive ? theme.accent : theme.border, backgroundColor: theme.bgCard, shadowOpacity: isActive ? 0.35 : 0.18, transform: [{ scale: isActive ? 1 : 0.97 }], }, ]} >
          {/* A4 page placeholder */}
          <View style={styles.pageInner}>
            {/* Header band */}
            <View style={[ styles.pageHeader, { backgroundColor: theme.accent + "33" }, ]} >
              <Text style={styles.pageHeaderTitle}>{item.name}</Text>
              <Text style={styles.pageHeaderTag}>{item.tag}</Text>
            </View>

            {/* Fake content lines as visual placeholder */}
            <View style={styles.pageBody}>
              <View style={styles.pageLineWide} />
              <View style={styles.pageLineMedium} />
              <View style={styles.pageLineShort} />

              <View style={styles.pageSectionBlock}>
                <View style={styles.pageSectionTitle} />
                <View style={styles.pageBullet} />
                <View style={styles.pageBullet} />
                <View style={styles.pageBulletHalf} />
              </View>

              <View style={styles.pageSectionBlock}>
                <View style={styles.pageSectionTitle} />
                <View style={styles.pageColumnRow}>
                  <View style={styles.pageColumn} />
                  <View style={styles.pageColumn} />
                </View>
              </View>
            </View>
          </View>

          {/* Call-to-action strip at the bottom of the card */}
          <View style={styles.pageFooter}>
            <Text style={[styles.pageFooterText, { color: theme.textPrimary }]}>
              Tap to use this template
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Text style={[styles.title, { color: theme.textPrimary }]}>
        Choose a template style
      </Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Swipe between layouts. When you select one, you’ll customize the
        details on the next screen and export as PDF.
      </Text>

      <FlatList
        data={TEMPLATES}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: (SCREEN_WIDTH - PAGE_WIDTH) / 2,
          paddingTop: 10,
          paddingBottom: 18,
        }}
        snapToInterval={PAGE_WIDTH + ITEM_SPACING}
        decelerationRate="fast"
        onMomentumScrollEnd={onMomentumEnd}
        renderItem={renderItem}
      />

      {/* Pagination dots */}
      <View style={styles.dotsRow}>
        {TEMPLATES.map((tpl, idx) => {
          const isActive = idx === currentIndex;
          return (
            <View key={tpl.id} style={[ styles.dot, { opacity: isActive ? 1 : 0.4, width: isActive ? 10 : 6, }, ]} />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 52 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 4, paddingHorizontal: 16 },
  subtitle: { fontSize: 13, marginBottom: 8, paddingHorizontal: 16 },

  pageOuter: {
    height: PAGE_HEIGHT + 32,
    borderWidth: 1,
    borderRadius: 18,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 14 },
    shadowRadius: 22,
    elevation: 6,
  },
  pageInner: {
    height: PAGE_HEIGHT,
    borderRadius: 12,
    backgroundColor: "#020617",
    overflow: "hidden",
  },
  pageHeader: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148,163,184,0.4)",
  },
  pageHeaderTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#e5e7eb",
  },
  pageHeaderTag: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 2,
  },
  pageBody: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  pageLineWide: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(148,163,184,0.4)",
    marginBottom: 8,
    width: "70%",
  },
  pageLineMedium: {
    height: 5,
    borderRadius: 999,
    backgroundColor: "rgba(148,163,184,0.3)",
    marginBottom: 6,
    width: "55%",
  },
  pageLineShort: {
    height: 4,
    borderRadius: 999,
    backgroundColor: "rgba(148,163,184,0.25)",
    marginBottom: 12,
    width: "40%",
  },
  pageSectionBlock: {
    marginTop: 8,
  },
  pageSectionTitle: {
    width: "55%",
    height: 5,
    borderRadius: 999,
    backgroundColor: "rgba(148,163,184,0.35)",
    marginBottom: 6,
  },
  pageBullet: {
    width: "100%",
    height: 4,
    borderRadius: 999,
    backgroundColor: "rgba(75,85,99,0.7)",
    marginBottom: 4,
  },
  pageBulletHalf: {
    width: "70%",
    height: 4,
    borderRadius: 999,
    backgroundColor: "rgba(55,65,81,0.7)",
    marginBottom: 4,
  },
  pageColumnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  pageColumn: {
    width: "47%",
    height: 40,
    borderRadius: 6,
    backgroundColor: "rgba(31,41,55,0.9)",
  },

  pageFooter: {
    marginTop: 50,
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 999,
    alignItems: "center",
  },
  pageFooterText: {
    fontSize: 11,
    opacity: 0.8,
  },

  dotsRow: {
    flexDirection: "row",
    alignSelf: "center",
    marginBottom: 14,
    marginTop: 2,
  },
  dot: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "#9ca3af",
    marginHorizontal: 4,
  },
});
