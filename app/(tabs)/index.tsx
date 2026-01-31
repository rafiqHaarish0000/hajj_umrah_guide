import { getTranslation } from "@/constants/translations";
import { useApp } from "@/context/AppContext";
import { useRouter } from "expo-router";
import {
  AlertCircle,
  Bell,
  BookMarked,
  BookOpen,
  Calendar,
  Clock,
  Map,
  MapPin,
  Phone,
  Users,
} from "lucide-react-native";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const { language, userName, groupCode } = useApp();

  const t = (
    key: keyof typeof import("@/constants/translations").translations.en,
  ) => getTranslation(language ?? "en", key);

  const handleProfilePress = () => {
    router.push("./profile");
  };

  const getInitials = (name: string | null): string => {
    if (!name) return "U";
    const words = name.trim().split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const menuItems = [
    {
      id: "map",
      title: t("liveMap"),
      icon: Map,
      color: "#FF6B6B",
      route: "/map",
    },
    {
      id: "announcements",
      title: t("announcements"),
      icon: Bell,
      color: "#4ECDC4",
      route: "/announcements",
    },
    {
      id: "facilities",
      title: t("nearbyPlaces"),
      icon: MapPin,
      color: "#45B7D1",
      route: "/facilities",
    },
    {
      id: "prayer",
      title: t("prayerQibla"),
      icon: Clock,
      color: "#FFA07A",
      route: "/prayer",
    },
    {
      id: "duas",
      title: t("duas"),
      icon: BookOpen,
      color: "#98D8C8",
      route: "/duas",
    },
    {
      id: "dailyplan",
      title: t("checklist"),
      icon: Calendar,
      color: "#96a088",
      route: "/daily-plan",
    },
    {
      id: "ritualguide",
      title: t("mistakePrevension"),
      icon: BookMarked,
      color: "#95e28b",
      route: "/ritual-guide",
    },
    {
      id: "emergency",
      title: t("emergency"),
      icon: Phone,
      color: "#b87373",
      route: "/panic",
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.backgroundTop} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>As-salamu alaykum</Text>
            <Text style={styles.userName}>{userName || "Pilgrim"}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={handleProfilePress}
            activeOpacity={0.8}
          >
            <Text style={styles.profileInitials}>{getInitials(userName)}</Text>
          </TouchableOpacity>
        </View>

        {groupCode && (
          <View style={styles.groupCard}>
            <Users size={24} color="#0D7C66" strokeWidth={2.5} />
            <View style={styles.groupInfo}>
              <Text style={styles.groupLabel}>Group Code</Text>
              <Text style={styles.groupCode}>{groupCode}</Text>
            </View>
          </View>
        )}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Quick Access</Text>

          <View style={styles.grid}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                onPress={() => router.push(item.route as any)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: item.color },
                  ]}
                >
                  <item.icon size={32} color="#FFFFFF" strokeWidth={2.5} />
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.tipCard}>
            <AlertCircle size={24} color="#0D7C66" strokeWidth={2.5} />
            <Text style={styles.tipText}>
              Stay hydrated and keep your phone charged.
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
    height: 250,
    backgroundColor: "#0D7C66",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInitials: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#0D7C66",
  },
  groupCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  groupInfo: {
    marginLeft: 12,
  },
  groupLabel: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#666666",
    marginBottom: 2,
  },
  groupCode: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#0D7C66",
    letterSpacing: 2,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  sectionTitle: {
    marginTop: 50,
    fontSize: 22,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 24,
  },
  card: {
    width: "47%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#1A1A1A",
    textAlign: "center",
  },
  tipCard: {
    flexDirection: "row",
    backgroundColor: "#E6F7F4",
    borderRadius: 16,
    padding: 20,
    alignItems: "flex-start",
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500" as const,
    color: "#0D7C66",
    lineHeight: 22,
    marginLeft: 12,
  },
});
