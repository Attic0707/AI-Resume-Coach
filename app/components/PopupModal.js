import React, { useEffect, useRef } from "react";
import { Modal, View, Text, TouchableOpacity, Pressable, Animated, StyleSheet, Platform } from "react-native";

export default function PopupModal({
  visible,
  onClose,
  title,
  leftText = "Cancel",
  rightText = "Save",
  onLeftPress,
  onRightPress,
  theme,
  children,
  maxWidth = 560,
  maxHeight = 0.86, // screen %
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    if (!visible) return;
    opacity.setValue(0);
    scale.setValue(0.96);

    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, speed: 18, bounciness: 7, useNativeDriver: true }),
    ]).start();
  }, [visible]);

  return (
    <Modal visible={!!visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <Animated.View
          style={[
            styles.card,
            {
              opacity,
              transform: [{ scale }],
              backgroundColor: theme?.bgCard,
              borderColor: theme?.border,
              maxWidth,
              maxHeight: `${Math.round(maxHeight * 100)}%`,
            },
          ]}
        >
          <View style={[styles.header, { borderColor: theme?.border }]}>
            <TouchableOpacity onPress={onLeftPress || onClose} hitSlop={HIT}>
              <Text style={[styles.left, { color: theme?.textSecondary }]}>{leftText}</Text>
            </TouchableOpacity>

            <Text style={[styles.title, { color: theme?.textPrimary }]} numberOfLines={1}>
              {title}
            </Text>

            <TouchableOpacity onPress={onRightPress} hitSlop={HIT}>
              <Text style={[styles.right, { color: theme?.accent }]}>{rightText}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const HIT = { top: 12, bottom: 12, left: 12, right: 12 };

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 14 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.60)" },
  card: {
    width: "92%",
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: Platform.OS === "ios" ? 0.35 : 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 14,
  },
  header: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  title: { flex: 1, textAlign: "center", fontSize: 15, fontWeight: "800" },
  left: { fontSize: 13, fontWeight: "700" },
  right: { fontSize: 13, fontWeight: "900" },
  content: { padding: 14 },
});
