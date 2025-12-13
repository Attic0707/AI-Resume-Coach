// app/screens/TemplatePickerScreen.js
import React, { useContext, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated } from "react-native";
import { AppContext } from "../context/AppContext";
import { templateRegistry } from "../templates/templateRegistry";
import { renderTemplatePreview } from "../templates/renderTemplatePreview";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PAGE_WIDTH = SCREEN_WIDTH * 0.75;
const PAGE_HEIGHT = PAGE_WIDTH * 1.414;
const SPACING = 18;

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

    // ✅ KEEP AS-IS
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: "clamp",
    });

    // ✅ KEEP AS-IS
    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.5, 1, 0.5],
      extrapolate: "clamp",
    });

    return (
      <View style={{ width: PAGE_WIDTH + SPACING }}>
        <Animated.View style={[styles.cardWrapper, { transform: [{ scale }], opacity }]}>
          {/* A4 page preview (single source of truth) */}
          <View style={styles.previewPageOuter}>
            <View style={{ flex: 1 }}>
              {renderTemplatePreview({
                templateId: item.id,
                data: item.previewData || {},
                photoUri: null,
              })}
            </View>
          </View>

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
        data={templateRegistry}
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
  subtitle: { fontSize: 13, marginHorizontal: 16, marginBottom: 8 },

  cardWrapper: { alignItems: "center" },

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

  cardTitle: { fontSize: 16, fontWeight: "600", marginTop: 2 },
  cardTag: { fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginTop: 2 },
  cardDesc: { fontSize: 12, marginTop: 4, textAlign: "center", paddingHorizontal: 12 },
  useButton: { marginTop: 8, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  useButtonText: { fontSize: 12, fontWeight: "600" },
});
