// App.js
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Purchases from "react-native-purchases";

import { AppProvider } from "./app/context/AppContext";
import HomeScreen from "./app/screens/HomeScreen";
import OnboardingScreen from "./app/screens/OnboardingScreen";
import UploadResumeScreen from "./app/screens/UploadResumeScreen";
import TemplatePickerScreen from "./app/screens/TemplatePickerScreen";
import MyDocumentsScreen from "./app/screens/MyDocumentsScreen";
import UpgradeScreen from "./app/screens/UpgradeScreen";

import TemplateEditorScreen from "./app/screens/TemplateEditorScreen";
import ResumeEditorScreen from "./app/screens/ResumeEditorScreen";

import OptimizeResumeScreen from "./app/screens/OptimizeResumeScreen";
import JobMatchScreen from "./app/screens/JobMatchScreen";
import InterviewCoachScreen from "./app/screens/InterviewCoachScreen";
import BulletRewriterScreen from "./app/screens/BulletRewriterScreen";
import JobAnalyzerScreen from "./app/screens/JobAnalyzerScreen";
import LinkedInOptimizerScreen from "./app/screens/LinkedInOptimizerScreen";

import { pingBackend } from "./app/utils/api";

const Stack = createNativeStackNavigator();
const REVCAT_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    // Wake Backend
    pingBackend();

    // RevenueCat setup
    if (!REVCAT_API_KEY) {
      console.warn(
        "[RevenueCat] EXPO_PUBLIC_REVENUECAT_API_KEY is missing. Purchases.configure will be skipped."
      );
      return;
    }
    Purchases.configure({
      apiKey: REVCAT_API_KEY,
    });

    (async () => {
      const value = await AsyncStorage.getItem("hasSeenOnboarding");
      setHasSeenOnboarding(value === "true");
      setIsLoading(false);
    })();

    if (isLoading) return null
  }, []);

  return (
    <AppProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!hasSeenOnboarding && (
            <Stack.Screen name="Onboarding">
              {(props) => (
                <OnboardingScreen {...props} onFinish={async () => { 
                  await AsyncStorage.setItem("hasSeenOnboarding", "true");
                  setHasSeenOnboarding(true);
                }} />
              )}
            </Stack.Screen>
          )}
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: "ResumeIQ", headerShown: true }} />
          <Stack.Screen name="UploadResume" component={UploadResumeScreen} options={{ title: "Upload your Resume", headerShown: true }} />
          <Stack.Screen name="TemplatePicker" component={TemplatePickerScreen} options={{ title: "Pick a Template", headerShown: true }} />
          <Stack.Screen name="MyDocuments" component={MyDocumentsScreen} options={{ title: "My Documents", headerShown: true }} />
          <Stack.Screen name="InterviewCoach" component={InterviewCoachScreen} options={{ title: "Interview Coach", headerShown: true }} />
          <Stack.Screen name="Upgrade" component={UpgradeScreen} options={{ title: "Upgrade & Theme", headerShown: true }}/>
          <Stack.Screen name="TemplateEditor" component={TemplateEditorScreen} options={{ title: "Edit your Template", headerShown: true }}/>
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}