// app/screens/WelcomeScreen.js
import React, { useContext, useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, ImageBackground, Animated } from "react-native";

import { AppContext } from "../context/AppContext";
import styles from "../styles";
const image = require("../../assets/splash-icon.png");

export default function WelcomeScreen({ navigation }) {
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

  return (
    <ImageBackground source={image} style={styles.background} resizeMode="cover" >
        <View style={styles.centerWrapper}>
          <TouchableOpacity style={[ styles.circleButton, {backgroundColor: theme.accent},] } onPress={() => navigation.replace("Home")} >
            <Animated.View pointerEvents="none" style={[ styles.shineOverlay, { transform: [ { translateX: shineTranslateX }, { rotate: "25deg" }, ], }, ]} />
            <Text style={[ styles.circleText, { color: theme.textOnAccent }, ]} >
              Start
            </Text>
          </TouchableOpacity>
        </View>
    </ImageBackground>
  );
}