// app/screens/OnboardingScreen.js
import React, { useContext, useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, ImageBackground, Animated, StyleSheet, PanResponder } from "react-native";
import { AppContext } from "../context/AppContext";

const image = require("../../assets/splash-icon.png");
const STEPS = [
  {
    title: "Fix your existing resume",
    description: "Upload your current CV and let AI help you rewrite and polish each section.",
  },
  {
    title: "Start from a proven template",
    description: "Pick a template, answer a few questions, and generate a complete resume.",
  },
  {
    title: "Improve anytime",
    description: "Use our sidebar tools for job matching, cover letters, LinkedIn and more.",
  },
];

export default function OnboardingScreen({ navigation, onFinish }) {
  const { theme } = useContext(AppContext);
  const shineAnim = useRef(new Animated.Value(0)).current;
  const shineTranslateX = shineAnim.interpolate({ inputRange: [0, 1], outputRange: [-260, 260], });

  useEffect(() => {
    Animated.loop(
      Animated.timing(shineAnim, {
        toValue: 1,
        duration: 2500,
        useNativeDriver: true,
      })
    ).start();
  }, [shineAnim]);

  const [index, setIndex] = useState(0);
  const step = STEPS[index];

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const { dx, dy } = gestureState;
        // Only grab when horizontal movement is stronger than vertical
        return Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dx } = gestureState;

        setIndex((prev) => {
          // swipe left → go forward
          if (dx < -50) {
            return Math.min(prev + 1, STEPS.length - 1);
          }
          // swipe right → go back
          if (dx > 50) {
            return Math.max(prev - 1, 0);
          }
          // small swipe → no change
          return prev;
        });
      },
    })
  ).current;

  const handleGetStarted = () => {
    if (onFinish) {
      onFinish();
    }
    navigation.replace("Home");
  };

  return (
    <ImageBackground source={image} style={styles.background} resizeMode="cover" >
        <View style={styles.centerWrapper} {...panResponder.panHandlers}>
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.desc}>{step.description}</Text>
          <View style={styles.dots}>
            {STEPS.map((_, i) => (
              <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
            ))}
          </View>
          <TouchableOpacity style={[ styles.circleButton, {backgroundColor: theme.accent},] } onPress={handleGetStarted} >
            <Animated.View pointerEvents="none" style={[ styles.shineOverlay, { transform: [ { translateX: shineTranslateX }, { rotate: "25deg" }, ], }, ]} />
            <Text style={[ styles.circleText, { color: theme.textOnAccent }, ]} >
              Start
            </Text>
          </TouchableOpacity>
        </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  background: { 
    flex: 1
  },
  logo: { fontSize: 24, color: "#e5e7eb", marginBottom: 24 },
  title: {
    fontSize: 22,
    color: "#e5e7eb",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  desc: {
    fontSize: 16,
    color: "#9ca3af",
    textAlign: "center",
  },
  dots: {
    flexDirection: "row",
    marginTop: 32,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4b5563",
    marginHorizontal: 4,
  },
  dotActive: { backgroundColor: "#fbbf24" },
  button: {
    backgroundColor: "#fbbf24",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 999,
  },
  buttonText: { fontWeight: "600" },
  skip: {
    marginTop: 12,
    color: "#9ca3af",
    fontSize: 14,
  },
  centerWrapper: {
    position: "absolute",
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: "center",
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
  shineOverlay: {
    position: "absolute",
    top: -40,
    left: -80,
    width: 120,
    height: 340,
    backgroundColor: "rgba(255, 255, 255, 0.35)",
    borderRadius: 60,
  },
  circleText: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 30,
  },
});
