// app/screens/TemplatePickerScreen.js
import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, } from "react-native";
import { AppContext } from "../context/AppContext";

const TEMPLATES = [
  {
    id: "classic",
    name: "Classic",
    tag: "Timeless",
    description:
      "Single-column layout with clear sections. Great for most roles and stable career paths.",
  },
  {
    id: "traditional",
    name: "Traditional",
    tag: "Conservative",
    description:
      "Full-page, traditional structure. Ideal for formal industries and long work histories.",
  },
  {
    id: "professional",
    name: "Professional",
    tag: "Corporate",
    description:
      "Clean, well-organized layout that keeps the focus on your experience and skills.",
  },
  {
    id: "clear",
    name: "Clear",
    tag: "Two-column",
    description:
      "Modern header with structured sections. Great for highlighting skills and key facts quickly.",
  },
  {
    id: "creative",
    name: "Creative",
    tag: "Stand-out",
    description:
      "More visual emphasis. Good for creative fields where personality and style matter.",
  },
];

export default function TemplatePickerScreen({ navigation }) {
  const { theme } = useContext(AppContext);

  const handleSelect = (tpl) => {
    navigation.navigate("TemplateEditor", {
      templateId: tpl.id,
      templateName: tpl.name,
    });
  };

  return (
    <View style={[ styles.container, { backgroundColor: theme.bg }, ]} >
      <Text style={[styles.title, { color: theme.textPrimary }]}>
        Choose a template style
      </Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        This affects the structure and emphasis of your resume when you export
        it later. You can always change content anytime.
      </Text>

      <FlatList data={TEMPLATES} keyExtractor={(item) => item.id} contentContainerStyle={{ paddingVertical: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={[ styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border, }, ]} 
            activeOpacity={0.85} onPress={() => handleSelect(item)} >
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: theme.textPrimary }]} >
                {item.name}
              </Text>
              <Text style={[styles.tag, { color: theme.accent }]} >
                {item.tag}
              </Text>
            </View>
            <Text style={[styles.cardDesc, { color: theme.textSecondary }]} >
              {item.description}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 52 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 4 },
  subtitle: { fontSize: 13, marginBottom: 12 },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 4,
  },
  cardTitle: { fontSize: 17, fontWeight: "600" },
  tag: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  cardDesc: { fontSize: 13 },
});
