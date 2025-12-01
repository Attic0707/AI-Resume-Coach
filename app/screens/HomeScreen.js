// app/screens/HomeScreen.js
import React, { useContext } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";

import { AppContext, ProBadge, ProOnlyFeatureTile, } from "../context/AppContext";
import styles from "../styles";

function FeatureCard({ title, description, emoji, onPress }) {
  const { theme } = useContext(AppContext);

  return (
    <TouchableOpacity style={[ styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border, }, ]} onPress={onPress} >
      <Text style={styles.cardEmoji}>{emoji}</Text>
      <View style={styles.cardTextWrapper}>
        <Text style={[ styles.cardTitle, { color: theme.textPrimary }, ]} >
          {title}
        </Text>
        <Text style={[ styles.cardDescription, { color: theme.textSecondary }, ]} >
          {description}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const { theme, isPro, freeCreditsLeft } = useContext(AppContext);

  return (
    <View style={[ styles.homeContainer, { backgroundColor: theme.bg }, ]} >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", }} >
        <Text style={styles.homeTitle}>Resume-IQ</Text>
        <ProBadge />
      </View>

      <Text style={[ styles.homeTitle, { color: theme.textPrimary }, ]} >
        What do you want to work on?
      </Text>
      <Text style={[ styles.homeSubtitle, { color: theme.textSecondary }, ]} >
        Pick a tool and I’ll help you step by step.
      </Text>

      {!isPro && (
        <Text style={[ styles.sectionSubtitle, { color: theme.textSecondary }, ]} >
          Free credits left: {freeCreditsLeft}
        </Text>
      )}

      <ScrollView contentContainerStyle={styles.cardList} showsVerticalScrollIndicator={false} >
        <FeatureCard title="Optimize My Resume" description="Rewrite and improve your CV for maximum impact." emoji="📄" onPress={() => navigation.navigate("OptimizeResume")} />
        <FeatureCard title="Match to Job Description" description="Tailor your resume & cover letter for a specific role." emoji="🎯" onPress={() => navigation.navigate("JobMatch")} />
        <FeatureCard title="Interview Coach" description="Practice questions and get instant feedback." emoji="🎤" onPress={() => navigation.navigate("InterviewCoach")} />

        <ProOnlyFeatureTile title="Salary Benchmarks" subtitle="Coming soon: Pro-only salary insights for your target role." onPress={() => navigation.navigate("Upgrade")} />
        <ProOnlyFeatureTile title="Advanced Templates" subtitle="Export ATS-ready resumes with different layouts and tones." onPress={() => navigation.navigate("AdvancedTemplates")}/> 

        <FeatureCard title="My Documents" description="View, edit and export saved resumes & letters." emoji="📁" onPress={() => navigation.navigate("Documents")} />
        <FeatureCard title="Upgrade & Theme" description="Manage plan and switch light/dark mode." emoji="⭐" onPress={() => navigation.navigate("Upgrade")} />
      </ScrollView>
    </View>
  );
}
