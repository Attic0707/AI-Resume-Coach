// src/screens/HomeScreen.js
import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { AppContext, ProBadge, ProOnlyFeatureTile, FeatureCard, UsageBanner } from "../context/AppContext";

const documentsIcon = require("../../assets/icons/docs.png");
const optimizeIcon = require("../../assets/icons/optimize.png");
const matchIcon = require("../../assets/icons/match.png");
const coachIcon = require("../../assets/icons/coach.png");
const bulletIcon = require("../../assets/icons/bullet.png");
const analysisIcon = require("../../assets/icons/analysis.png");
const optimizerIcon = require("../../assets/icons/optimizer.png");
const salaryIcon = require("../../assets/icons/salary.png");
const advancedIcon = require("../../assets/icons/advanced.png");
const upgradeIcon = require("../../assets/icons/upgrade.png");

export default function HomeScreen({ navigation }) {
  const { theme, isPro, freeCreditsLeft } = useContext(AppContext);

  return (
    <View style={[ styles.homeContainer, { backgroundColor: theme.bg }, ]} >
        <UsageBanner />
      <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "right", }} >
        <ProBadge />
      </View>

      <Text style={[ styles.homeTitle, { color: theme.textPrimary }, ]} >
        Ready to get your dream job?
      </Text>
      <Text style={[ styles.homeSubtitle, { color: theme.textSecondary }, ]} >
        Optimize your CV, match job descriptions and practice interviews with AI.
      </Text>

      {!isPro && (
        <Text style={[ styles.sectionSubtitle, { color: theme.textSecondary }, ]} >
          Free credits left: {freeCreditsLeft}
        </Text>
      )}

      <ScrollView contentContainerStyle={styles.cardList} showsVerticalScrollIndicator={false} >
        <FeatureCard title="Upload / Import Resume" description="Paste your current CV or import it, then improve each section with AI suggestions." icon={optimizeIcon} onPress={() => navigation.navigate("UploadResume")} />
        <FeatureCard title="Start from Template" description="Pick a layout, answer guided questions, and generate a complete resume." icon={optimizeIcon} onPress={() => navigation.navigate("TemplatePicker")} />
        <FeatureCard title="My Documents" description="View, edit and export saved resumes & letters." icon={documentsIcon} onPress={() => navigation.navigate("MyDocuments")} />
        <ProOnlyFeatureTile title="Interview Coach" subtitle="Practice questions and get instant feedback." icon={coachIcon} onPress={() => navigation.navigate("InterviewCoach")} />
        <FeatureCard title="Upgrade & Theme" description="Manage plan and switch light/dark mode." icon={upgradeIcon} onPress={() => navigation.navigate("Upgrade")} />
      </ScrollView>
    </View>

    /*
        <FeatureCard title="Optimize My Resume" description="Rewrite and improve your CV for maximum impact." icon={optimizeIcon} onPress={() => navigation.navigate("OptimizeResume")} />
        <FeatureCard title="Match to Job Description" description="Tailor your resume & cover letter for a specific role." icon={matchIcon} onPress={() => navigation.navigate("JobMatch")} />
        <FeatureCard title="Interview Coach" description="Practice questions and get instant feedback." icon={coachIcon} onPress={() => navigation.navigate("InterviewCoach")} />
        <FeatureCard title="Bullet Rewriter" description="Turn existing bullet points into stronger, more professional lines." icon={bulletIcon} onPress={() => navigation.navigate("BulletRewriter")} />

        <ProOnlyFeatureTile title="Job Analyzer" subtitle="Analyze the job description." icon={analysisIcon} onPress={() => navigation.navigate("LinkedInOJobAnalyzerptimizer")} />
        <ProOnlyFeatureTile title="LinkedIn Optimization" subtitle="Rewrite your About/Experience for more impact and keywords." icon={optimizerIcon} onPress={() => navigation.navigate("LinkedInOptimizer")} />

        <FeatureCard title="My Documents" description="View, edit and export saved resumes & letters." icon={documentsIcon} onPress={() => navigation.navigate("Documents")} />
    */
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  logo: {
    fontSize: 18,
    color: "#9ca3af",
    marginBottom: 12,
    fontWeight: "600",
  },
  title: {
    fontSize: 26,
    color: "#e5e7eb",
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#9ca3af",
    marginBottom: 24,
  },
  cardPrimary: {
    backgroundColor: "#0f172a",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#374151",
  },
  cardSecondary: {
    backgroundColor: "#0f172a",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#374151",
  },
  cardTag: {
    fontSize: 11,
    color: "#facc15",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  cardTitle: {
    fontSize: 18,
    color: "#e5e7eb",
    fontWeight: "600",
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 13,
    color: "#9ca3af",
  },
  link: {
    marginTop: 24,
    fontSize: 13,
    color: "#38bdf8",
  },

  // Home
  homeContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  homeTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
    color: "#e5e7eb",
  },
  homeSubtitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  cardList: {
    marginTop: 20,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginBottom: 16,
  },
});
