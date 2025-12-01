// app/screens/WelcomeScreen.js
import React, { useContext } from "react";
import { View, Text, TouchableOpacity } from "react-native";

import { AppContext } from "../context/AppContext";
import styles from "../styles";

export default function WelcomeScreen({ navigation }) {
  const { theme } = useContext(AppContext);

  return (
    <View style={[ styles.welcomeContainer, { backgroundColor: theme.bg }, ]} >
      <Text style={[ styles.appTitle, { color: theme.textPrimary }, ]} >
        AI Resume & Interview Coach
      </Text>
      <Text style={[ styles.appSubtitle, { color: theme.textSecondary }, ]}  >
        Optimize your CV, match job descriptions and practice interviews
        with AI.
      </Text>

      <TouchableOpacity style={[ styles.primaryButton, { backgroundColor: theme.accent }, ]} onPress={() => navigation.replace("Home")} >
        <Text style={[ styles.primaryButtonText, { color: theme.textOnAccent }, ]} >
          Continue
        </Text>
      </TouchableOpacity>
    </View>
  );
}