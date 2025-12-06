// app/screens/UpgradeScreen.js
import React, { useContext, useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, } from "react-native";
import Purchases from "react-native-purchases";
import { AppContext } from "../context/AppContext";
import styles from "../styles";

const isDev = __DEV__;

export default function UpgradeScreen() {
  const { theme, themeName, toggleTheme, isPro, upgradeToPro, freeCreditsLeft, } = useContext(AppContext);
  const [offerings, setOfferings] = useState(null);
  const [loadingOfferings, setLoadingOfferings] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);

  useEffect(() => {
    const loadOfferings = async () => {
      try {
        const o = await Purchases.getOfferings();
        setOfferings(o.current);
      } catch (e) {
        console.log("RevenueCat offerings error:", e);
      } finally {
        setLoadingOfferings(false);
      }
    };

    loadOfferings();
  }, []);

  const handlePurchase = async () => {
    try {
      if (!offerings || !offerings.availablePackages?.length) {
        Alert.alert( "No packages", "No products are configured in the RevenueCat store yet." );
        return;
      }

      const pkg = offerings.availablePackages[0];
      setPurchaseLoading(true);

      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const hasPro = customerInfo.entitlements?.active?.premium != null;

      if (hasPro) {
        upgradeToPro();
        Alert.alert("Success", "You are now ResumeIQ Pro 🎉");
      } else {
        Alert.alert("Info", "Purchase completed but Pro entitlement is not active. Check RevenueCat config." );
      }
    } catch (e) {
      console.log("Purchase error:", e);

      if (!e.userCancelled) {
        Alert.alert( "Error", "Something went wrong while processing your purchase." );
      }
    } finally {
      setPurchaseLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      setRestoreLoading(true);

      const customerInfo = await Purchases.restorePurchases();
      const hasPro = customerInfo.entitlements?.active?.premium != null;

      if (hasPro) {
        upgradeToPro();
        Alert.alert( "Restored", "Your ResumeIQ Pro membership has been restored 🎉" );
      } else {
        Alert.alert( "No purchases", "No active Pro subscription found to restore." );
      }
    } catch (e) {
      console.log("Restore error:", e);
      Alert.alert( "Error", "Something went wrong while restoring purchases." );
    } finally {
      setRestoreLoading(false);
    }
  };

  return (
    <View style={[ styles.optimizeContainer, { backgroundColor: theme.bg }, ]} >
      <ScrollView contentContainerStyle={styles.optimizeScroll}>
        <Text style={[ styles.sectionTitle, { color: theme.textPrimary }, ]} >
          {isPro ? "You are Pro 🎉" : "Upgrade to Pro"}
        </Text>
        <Text style={[ styles.sectionSubtitle, { color: theme.textSecondary }, ]} >
          {isPro
            ? "You have unlimited access to resume optimization, job matching and interview coaching."
            : "Unlock unlimited resume rewrites, job-specific tailoring and interview coaching without limits."}
        </Text>

        {!isPro && (
          <View style={[ styles.resultBox, { backgroundColor: theme.bgCard, borderColor: theme.border, }, ]}  >
            <Text style={[ styles.resultTitle, { color: theme.textPrimary }, ]} >
              What you get
            </Text>
            <Text style={[ styles.resultText, { color: theme.textSecondary }, ]} >
              • Unlimited resume optimizations{"\n"}
              • Unlimited job description tailoring{"\n"}
              • Unlimited cover letter generations{"\n"}
              • Unlimited interview coaching sessions{"\n"}
              • Priority improvements & new features
            </Text>

            {/* Purchase button */}
            <TouchableOpacity style={[ styles.primaryButtonWide, { marginTop: 16, backgroundColor: theme.accent, opacity: purchaseLoading || loadingOfferings ? 0.7 : 1, }, ]} 
              onPress={handlePurchase} disabled={purchaseLoading || loadingOfferings} >
              {purchaseLoading ? (
                <ActivityIndicator color={theme.textOnAccent} /> ) : (
                <Text style={[ styles.primaryButtonText, { color: theme.textOnAccent }, ]} >
                  {loadingOfferings ? "Loading options..." : "Unlock Pro"}
                </Text>
              )}
            </TouchableOpacity>

            {/* Restore button */}
            <TouchableOpacity style={[ styles.secondaryButton, { marginTop: 12, borderColor: theme.border, opacity: restoreLoading ? 0.7 : 1, }, ]}
             onPress={handleRestore} disabled={restoreLoading} >
              {restoreLoading ? (
                <ActivityIndicator color={theme.textPrimary} />) : (
                <Text style={[ styles.secondaryButtonText, { color: theme.textPrimary }, ]} >
                  Restore Purchases
                </Text>
              )}
            </TouchableOpacity>

            <Text style={[ styles.sectionSubtitle, { marginTop: 12, color: theme.textSecondary, }, ]} >
              Free credits left: {freeCreditsLeft}
            </Text>

            <Text style={[ styles.sectionSubtitle, { marginTop: 4, fontSize: 12, color: theme.textSecondary, textAlign: "center", }, ]} >
              Using RevenueCat Test Store – no real charges in dev.
            </Text>
          </View>
        )}

        {/* Theme section (unchanged) */}
        <View style={{ height: 24 }} />

        <Text style={[ styles.sectionTitle, { marginBottom: 8, color: theme.textPrimary }, ]}  >
          Theme
        </Text>
        <Text style={[ styles.sectionSubtitle, { marginBottom: 12, color: theme.textSecondary }, ]} >
          Current: {themeName === "dark" ? "Dark" : "Light"}
        </Text>

        <View style={styles.languageToggleWrapper}>
          <TouchableOpacity style={[ styles.languageButton, themeName === "light" && styles.languageButtonActive, ]}
            onPress={() => themeName !== "light" && toggleTheme() } >
            <Text style={[ styles.languageButtonText, themeName === "light" && styles.languageButtonTextActive, ]}  >
              Light
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[ styles.languageButton, themeName === "dark" && styles.languageButtonActive, ]}
            onPress={() => themeName !== "dark" && toggleTheme() } >
            <Text style={[ styles.languageButtonText, themeName === "dark" && styles.languageButtonTextActive, ]}  >
              Dark
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}