import { getTranslation } from "@/constants/translations";
import { useApp } from "@/context/AppContext";
import { Calendar, CheckCircle2, Circle, Volume2 } from "lucide-react-native";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Sample daily plan data - in production, this would be dynamic based on Hajj day
const dailyPlan = {
  hijriDate: "8th Dhul Hijjah 1446",
  hajjDay: "Day of Tarwiyah - Mina Day",
  rituals: [
    {
      id: "1",
      name: "Morning Preparation",
      description: "Perform Fajr prayer and prepare for departure to Mina",
      completed: true,
      hasAudio: true,
    },
    {
      id: "2",
      name: "Depart for Mina",
      description: "Leave after sunrise with your group",
      completed: true,
      hasAudio: false,
    },
    {
      id: "3",
      name: "Arrive at Mina",
      description: "Settle in your tent and rest before Dhuhr prayer",
      completed: false,
      hasAudio: true,
    },
    {
      id: "4",
      name: "Five Prayers in Mina",
      description: "Perform Dhuhr, Asr, Maghrib, Isha, and next Fajr",
      completed: false,
      hasAudio: true,
    },
    {
      id: "5",
      name: "Remember Allah",
      description: "Engage in dhikr, recitation of Quran, and dua",
      completed: false,
      hasAudio: true,
    },
    {
      id: "6",
      name: "Rest and Prepare",
      description: "Get adequate rest for tomorrow's journey to Arafat",
      completed: false,
      hasAudio: false,
    },
  ],
};

export default function DailyPlanScreen() {
  const { language } = useApp();
  const [rituals, setRituals] = useState(dailyPlan.rituals);

  const t = (
    key: keyof typeof import("@/constants/translations").translations.en,
  ) => getTranslation(language ?? "en", key);

  const toggleRitual = (id: string) => {
    setRituals(
      rituals.map((ritual) =>
        ritual.id === id ? { ...ritual, completed: !ritual.completed } : ritual,
      ),
    );
  };

  const playAudio = (ritualName: string) => {
    // Play audio guidance
    console.log("Playing audio for:", ritualName);
  };

  const completedCount = rituals.filter((r) => r.completed).length;
  const totalCount = rituals.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.backgroundTop} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Calendar size={40} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.headerTitle}>{t("todaysPlan")}</Text>
        </View>

        <View style={styles.dateCard}>
          <View style={styles.dateInfo}>
            <Text style={styles.hijriDate}>{dailyPlan.hijriDate}</Text>
            <Text style={styles.hajjDay}>{dailyPlan.hajjDay}</Text>
          </View>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>{t("yourProgress")}</Text>
            <Text style={styles.progressCount}>
              {completedCount} {t("of")} {totalCount} {t("completed")}
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progressPercentage}%` },
              ]}
            />
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>{t("todaysRituals")}</Text>

          {rituals.map((ritual, index) => (
            <TouchableOpacity
              key={ritual.id}
              style={[
                styles.ritualCard,
                ritual.completed && styles.ritualCardCompleted,
              ]}
              onPress={() => toggleRitual(ritual.id)}
              activeOpacity={0.8}
            >
              <View style={styles.ritualMain}>
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => toggleRitual(ritual.id)}
                >
                  {ritual.completed ? (
                    <CheckCircle2
                      size={32}
                      color="#0D7C66"
                      strokeWidth={2.5}
                      fill="#E6F7F4"
                    />
                  ) : (
                    <Circle size={32} color="#CCCCCC" strokeWidth={2.5} />
                  )}
                </TouchableOpacity>

                <View style={styles.ritualContent}>
                  <Text
                    style={[
                      styles.ritualName,
                      ritual.completed && styles.ritualNameCompleted,
                    ]}
                  >
                    {ritual.name}
                  </Text>
                  <Text
                    style={[
                      styles.ritualDescription,
                      ritual.completed && styles.ritualDescriptionCompleted,
                    ]}
                  >
                    {ritual.description}
                  </Text>
                </View>
              </View>

              {ritual.hasAudio && (
                <TouchableOpacity
                  style={styles.audioButton}
                  onPress={() => playAudio(ritual.name)}
                  activeOpacity={0.7}
                >
                  <Volume2 size={20} color="#0D7C66" strokeWidth={2.5} />
                  <Text style={styles.audioText}>{t("listen")}</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))}

          <View style={styles.reminderCard}>
            <Text style={styles.reminderText}>{t("dailyPlanReminder")}</Text>
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
    height: 200,
    backgroundColor: "#0D7C66",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    marginTop: 12,
  },
  dateCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 24,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  dateInfo: {
    alignItems: "center",
  },
  hijriDate: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#0D7C66",
    marginBottom: 6,
  },
  hajjDay: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#666666",
    textAlign: "center",
  },
  progressCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 24,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#1A1A1A",
  },
  progressCount: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#0D7C66",
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: "#E6F7F4",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#0D7C66",
    borderRadius: 6,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginBottom: 16,
  },
  ritualCard: {
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
  ritualCardCompleted: {
    backgroundColor: "#F8FBF9",
    borderWidth: 1,
    borderColor: "#D4EDE7",
  },
  ritualMain: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  checkboxContainer: {
    marginRight: 16,
    paddingTop: 2,
  },
  ritualContent: {
    flex: 1,
  },
  ritualName: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginBottom: 6,
    lineHeight: 24,
  },
  ritualNameCompleted: {
    color: "#0D7C66",
  },
  ritualDescription: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: "#666666",
    lineHeight: 22,
  },
  ritualDescriptionCompleted: {
    color: "#7AB5A7",
  },
  audioButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#E6F7F4",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 12,
    marginLeft: 48,
  },
  audioText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#0D7C66",
    marginLeft: 6,
  },
  reminderCard: {
    backgroundColor: "#FFF9F0",
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#FFE0B2",
  },
  reminderText: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: "#E65100",
    lineHeight: 22,
    textAlign: "center",
  },
});
