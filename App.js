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
import MyDocumentsScreen from "./app/screens/MyDocumentsScreen";
import UpgradeScreen from "./app/screens/UpgradeScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  // RevenueCat setup
  useEffect(() => {
    Purchases.configure({
      apiKey: "test_occeutlxPVPolTrDEKYepIdSRbT",
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
          <Stack.Screen name="Documents" component={MyDocumentsScreen} options={{ title: "My Documents" }}/>
          <Stack.Screen name="Upgrade" component={UpgradeScreen} options={{ title: "Upgrade & Theme" }}/>
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}