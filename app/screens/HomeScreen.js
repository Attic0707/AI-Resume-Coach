// app/screens/HomeScreen.js
import React, { useContext } from "react";
import { View, Text, ScrollView, } from "react-native";

import { AppContext, ProBadge, ProOnlyFeatureTile, FeatureCard } from "../context/AppContext";
import styles from "../styles";
const optimizeIcon = require("../../assets/icons/optimize.png");
const matchIcon = require("../../assets/icons/match.png");
const coachIcon = require("../../assets/icons/coach.png");
const bulletIcon = require("../../assets/icons/bullet.png");
const analysisIcon = require("../../assets/icons/analysis.png");
const salaryIcon = require("../../assets/icons/salary.png");
const advancedIcon = require("../../assets/icons/advanced.png");
const documentsIcon = require("../../assets/icons/docs.png");
const upgradeIcon = require("../../assets/icons/upgrade.png");

export default function HomeScreen({ navigation }) {
  const { theme, isPro, freeCreditsLeft } = useContext(AppContext);

  return (
    <View style={[ styles.homeContainer, { backgroundColor: theme.bg }, ]} >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", }} >
        <Text style={styles.homeTitle}>Resume-IQ</Text>
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
        <FeatureCard title="Optimize My Resume" description="Rewrite and improve your CV for maximum impact." icon={optimizeIcon} onPress={() => navigation.navigate("OptimizeResume")} />
        <FeatureCard title="Match to Job Description" description="Tailor your resume & cover letter for a specific role." icon={matchIcon} onPress={() => navigation.navigate("JobMatch")} />
        <FeatureCard title="Interview Coach" description="Practice questions and get instant feedback." icon={coachIcon} onPress={() => navigation.navigate("InterviewCoach")} />
        <FeatureCard title="Bullet Rewriter" description="Turn existing bullet points into stronger, more professional lines." icon={bulletIcon} onPress={() => navigation.navigate("BulletRewriter")} />
        <FeatureCard title="Job Analyzer" description="Analyze the job description." icon={analysisIcon} onPress={() => navigation.navigate("JobAnalyzer")} />
        <FeatureCard title="LinkedIn Optimization" description="Rewrite your About/Experience for more impact and keywords." icon={analysisIcon} onPress={() => navigation.navigate("LinkedInOptimizer")} />

        <ProOnlyFeatureTile title="Salary Benchmarks" subtitle="Pro-only salary insights for your target role. – tap to upgrade." icon={salaryIcon} onPress={() => navigation.navigate("Upgrade")} />
        <ProOnlyFeatureTile title="Advanced Templates" subtitle="Export ATS-ready resumes with different layouts and tones. – tap to upgrade." icon={advancedIcon} onPress={() => navigation.navigate("AdvancedTemplates")}/> 

        <FeatureCard title="My Documents" description="View, edit and export saved resumes & letters." icon={documentsIcon} onPress={() => navigation.navigate("Documents")} />
        <FeatureCard title="Upgrade & Theme" description="Manage plan and switch light/dark mode." icon={upgradeIcon} onPress={() => navigation.navigate("Upgrade")} />
      </ScrollView>
    </View>
  );
}