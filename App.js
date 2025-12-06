// App.js
import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Purchases from "react-native-purchases";

import { AppProvider } from "./app/context/AppContext";

import WelcomeScreen from "./app/screens/WelcomeScreen";
import HomeScreen from "./app/screens/HomeScreen";
import OptimizeResumeScreen from "./app/screens/OptimizeResumeScreen";
import JobMatchScreen from "./app/screens/JobMatchScreen";
import InterviewCoachScreen from "./app/screens/InterviewCoachScreen";
import BulletRewriterScreen from "./app/screens/BulletRewriterScreen";
import JobAnalyzerScreen from "./app/screens/JobAnalyzerScreen";
import LinkedInOptimizerScreen from "./app/screens/LinkedInOptimizerScreen";
import MyDocumentsScreen from "./app/screens/MyDocumentsScreen";
import UpgradeScreen from "./app/screens/UpgradeScreen";

const Stack = createNativeStackNavigator();
const REVCAT_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;

export default function App() {
  // RevenueCat setup
  useEffect(() => {
    if (!REVCAT_API_KEY) {
      console.warn(
        "[RevenueCat] EXPO_PUBLIC_REVENUECAT_API_KEY is missing. Purchases.configure will be skipped."
      );
      return;
    }
    Purchases.configure({
      apiKey: REVCAT_API_KEY,
    });
  }, []);

  return (
    <AppProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: true }} >
          <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: "ResumeIQ" }} />
          <Stack.Screen name="OptimizeResume" component={OptimizeResumeScreen} options={{ title: "Optimize Resume" }}/>
          <Stack.Screen name="JobMatch" component={JobMatchScreen} options={{ title: "Job Match" }}/>
          <Stack.Screen name="InterviewCoach" component={InterviewCoachScreen} options={{ title: "Interview Coach" }}/>
          <Stack.Screen name="BulletRewriter" component={BulletRewriterScreen} options={{ title: "Bullet Rewriter" }}/>
          <Stack.Screen name="JobAnalyzer" component={JobAnalyzerScreen} options={{ title: "Job Analyzer" }}/>
          <Stack.Screen name="LinkedInOptimizer" component={LinkedInOptimizerScreen} options={{ title: "LinkedIn Optimizer" }}/>
          <Stack.Screen name="Documents" component={MyDocumentsScreen} options={{ title: "My Documents" }}/>
          <Stack.Screen name="Upgrade" component={UpgradeScreen} options={{ title: "Upgrade & Theme" }}/>
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}