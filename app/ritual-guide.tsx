import { getTranslation } from "@/constants/translations";
import { useApp } from "@/context/AppContext";
import { BookMarked, CheckCircle, Info } from "lucide-react-native";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Sample ritual guides data
const ritualGuides = [
  {
    id: "ihram",
    title: "Ihram Guidelines",
    icon: "👔",
    remember: [
      "Perform Ghusl (bath) before wearing Ihram",
      "Make intention (niyyah) for Umrah or Hajj",
      "Recite Talbiyah frequently",
      "Keep your intention pure and focused on worship",
    ],
    avoid: [
      "Wearing stitched clothes for men",
      "Using perfume or scented products",
      "Cutting hair or nails",
      "Engaging in marital relations",
    ],
  },
  {
    id: "tawaf",
    title: "Tawaf Guidelines",
    icon: "🕋",
    remember: [
      "Begin at the Black Stone corner",
      "Keep the Kaaba on your left side",
      "Complete seven rounds with focus",
      "Make dua during each round",
      "Be patient and gentle with others",
    ],
    avoid: [
      "Pushing or causing harm to others",
      "Rushing through without reverence",
      "Stopping unnecessarily during circuits",
      "Taking photos during Tawaf",
    ],
  },
  {
    id: "sai",
    title: "Sa'i Guidelines",
    icon: "🚶",
    remember: [
      "Start at Safa and end at Marwah",
      "Walk at a comfortable pace",
      "Recite prescribed duas at Safa and Marwah",
      "Complete all seven rounds",
      "Stay hydrated during Sa'i",
    ],
    avoid: [
      "Running between Safa and Marwah (except green lights for men)",
      "Sitting unnecessarily during Sa'i",
      "Losing count of rounds",
      "Leaving before completing all rounds",
    ],
  },
  {
    id: "arafat",
    title: "Day of Arafat",
    icon: "⛰️",
    remember: [
      "Arrive at Arafat after Fajr",
      "Stay within the boundaries of Arafat",
      "Engage in sincere dua and dhikr",
      "Pray Dhuhr and Asr combined",
      "Stay until after sunset",
    ],
    avoid: [
      "Leaving Arafat before sunset",
      "Wasting time in unnecessary activities",
      "Neglecting to make dua",
      "Standing outside Arafat boundaries",
    ],
  },
];

export default function RitualGuideScreen() {
  const { language } = useApp();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const t = (
    key: keyof typeof import("@/constants/translations").translations.en,
  ) => getTranslation(language ?? "en", key);

  const handleToggle = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <View style={styles.container}>
      <View style={styles.backgroundTop} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <BookMarked size={40} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.headerTitle}>{t("ritualGuide")}</Text>
          <Text style={styles.headerSubtitle}>{t("guidanceWithLove")}</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.infoCard}>
            <Info size={24} color="#0D7C66" strokeWidth={2.5} />
            <Text style={styles.infoText}>{t("ritualGuideIntro")}</Text>
          </View>

          {ritualGuides.map((guide) => (
            <TouchableOpacity
              key={guide.id}
              style={styles.guideCard}
              onPress={() => handleToggle(guide.id)}
              activeOpacity={0.9}
            >
              <View style={styles.guideHeader}>
                <View style={styles.guideTitleContainer}>
                  <Text style={styles.guideIcon}>{guide.icon}</Text>
                  <Text style={styles.guideTitle}>{guide.title}</Text>
                </View>
                <View
                  style={[
                    styles.expandIndicator,
                    expandedId === guide.id && styles.expandIndicatorActive,
                  ]}
                >
                  <Text style={styles.expandText}>
                    {expandedId === guide.id ? "−" : "+"}
                  </Text>
                </View>
              </View>

              {expandedId === guide.id && (
                <View style={styles.guideContent}>
                  {/* Things to Remember Section */}
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <CheckCircle
                        size={20}
                        color="#0D7C66"
                        strokeWidth={2.5}
                      />
                      <Text style={styles.sectionTitle}>
                        {t("thingsToRemember")}
                      </Text>
                    </View>
                    <View style={styles.itemsList}>
                      {guide.remember.map((item, index) => (
                        <View key={index} style={styles.listItem}>
                          <View style={styles.bulletPoint} />
                          <Text style={styles.itemText}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Things to Avoid Section */}
                  <View style={[styles.section, styles.avoidSection]}>
                    <View style={styles.sectionHeader}>
                      <Info size={20} color="#E65100" strokeWidth={2.5} />
                      <Text style={[styles.sectionTitle, styles.avoidTitle]}>
                        {t("thingsToAvoid")}
                      </Text>
                    </View>
                    <View style={styles.itemsList}>
                      {guide.avoid.map((item, index) => (
                        <View key={index} style={styles.listItem}>
                          <View style={styles.bulletPointAvoid} />
                          <Text style={styles.itemText}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          ))}

          <View style={styles.encouragementCard}>
            <Text style={styles.encouragementText}>
              {t("ritualEncouragement")}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  backgroundTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 220,
    backgroundColor: "#0D7C66",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    marginTop: 12,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: "rgba(255, 255, 255, 0.85)",
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#E6F7F4",
    borderRadius: 16,
    padding: 20,
    alignItems: "flex-start",
    marginBottom: 24,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500" as const,
    color: "#0D7C66",
    lineHeight: 22,
    marginLeft: 12,
  },
  guideCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  guideHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  guideTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  guideIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  guideTitle: {
    fontSize: 19,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    flex: 1,
  },
  expandIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  expandIndicatorActive: {
    backgroundColor: "#0D7C66",
  },
  expandText: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#666666",
  },
  guideContent: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  section: {
    marginBottom: 24,
  },
  avoidSection: {
    marginBottom: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: "#0D7C66",
    marginLeft: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  avoidTitle: {
    color: "#E65100",
  },
  itemsList: {
    gap: 12,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingLeft: 8,
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#0D7C66",
    marginTop: 7,
    marginRight: 12,
  },
  bulletPointAvoid: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFA726",
    marginTop: 7,
    marginRight: 12,
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500" as const,
    color: "#1A1A1A",
    lineHeight: 24,
  },
  encouragementCard: {
    backgroundColor: "#E8F5E9",
    borderRadius: 16,
    padding: 24,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },
  encouragementText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#2E7D32",
    lineHeight: 24,
    textAlign: "center",
  },
});
