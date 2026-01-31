import { getTranslation, Language } from "@/constants/translations";
import { useApp } from "@/context/AppContext";
import { useRouter } from "expo-router";
import { Globe, LogOut, Users, X } from "lucide-react-native";
import React from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const { language, userName, groupCode, changeLanguage, leaveGroup, logout } =
    useApp();

  const t = (
    key: keyof typeof import("@/constants/translations").translations.en,
  ) => getTranslation(language ?? "en", key);

  const handleLanguageChange = () => {
    const languages: { code: Language; name: string }[] = [
      { code: "en", name: "English" },
      { code: "ar", name: "العربية" },
      { code: "ta", name: "தமிழ்" },
      { code: "ur", name: "اردو" },
    ];

    Alert.alert(
      t("changeLanguage"),
      "Select a language",
      languages.map((lang) => ({
        text: lang.name,
        onPress: () => changeLanguage(lang.code),
      })),
    );
  };

  const handleLeaveGroup = () => {
    Alert.alert(t("leaveGroup"), "Are you sure you want to leave this group?", [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("confirm"),
        style: "destructive",
        onPress: async () => {
          await leaveGroup();
          Alert.alert("Success", "You have left the group");
        },
      },
    ]);
  };

  const handleLogout = () => {
    Alert.alert(t("logout"), "Are you sure you want to logout?", [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("logout"),
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/");
        },
      },
    ]);
  };

  const getInitials = (name: string | null): string => {
    if (!name) return "U";
    const words = name.trim().split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>{t("profile")}</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <X size={28} color="#1A1A1A" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(userName)}</Text>
            </View>
            <Text style={styles.userName}>{userName || "User"}</Text>
            {groupCode && (
              <View style={styles.groupBadge}>
                <Users size={16} color="#0D7C66" strokeWidth={2.5} />
                <Text style={styles.groupBadgeText}>Group: {groupCode}</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("settings")}</Text>

            <TouchableOpacity
              style={styles.settingCard}
              onPress={handleLanguageChange}
              activeOpacity={0.8}
            >
              <View style={styles.settingIcon}>
                <Globe size={24} color="#0D7C66" strokeWidth={2.5} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{t("changeLanguage")}</Text>
                <Text style={styles.settingSubtitle}>
                  Current: {(language ?? "en").toUpperCase()}
                </Text>
              </View>
            </TouchableOpacity>

            {groupCode && (
              <TouchableOpacity
                style={styles.settingCard}
                onPress={handleLeaveGroup}
                activeOpacity={0.8}
              >
                <View style={styles.settingIcon}>
                  <Users size={24} color="#FFA07A" strokeWidth={2.5} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>{t("leaveGroup")}</Text>
                  <Text style={styles.settingSubtitle}>Exit current group</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <LogOut size={24} color="#DC3545" strokeWidth={2.5} />
            <Text style={styles.logoutButtonText}>{t("logout")}</Text>
          </TouchableOpacity>
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
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: "#1A1A1A",
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#0D7C66",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  userName: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginBottom: 8,
  },
  groupBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6F7F4",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  groupBadgeText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#0D7C66",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginBottom: 16,
  },
  settingCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  settingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E6F7F4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: "#1A1A1A",
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#666666",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    gap: 12,
    borderWidth: 2,
    borderColor: "#DC3545",
  },
  logoutButtonText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#DC3545",
  },
});
