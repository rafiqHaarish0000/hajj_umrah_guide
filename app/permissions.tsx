import { getTranslation } from "@/constants/translations";
import { useApp } from "@/context/AppContext";
import { useRouter } from "expo-router";
import { AlertCircle, Bell, MapPin, Shield, Users } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function PermissionsScreen() {
  const router = useRouter();
  const { language, requestLocationPermission, requestNotificationPermission } =
    useApp();
  const [isRequesting, setIsRequesting] = useState<boolean>(false);

  const t = (
    key: keyof typeof import("@/constants/translations").translations.en,
  ) => getTranslation(language, key);

  const handleContinue = async () => {
    setIsRequesting(true);

    // Request both permissions
    const locationGranted = await requestLocationPermission();
    const notificationGranted = await requestNotificationPermission();

    setIsRequesting(false);

    // Check location permission
    if (!locationGranted) {
      Alert.alert(
        t("permissions"),
        "Location access is required to track group members and find nearby facilities. Please enable it in your device settings.",
        [{ text: "OK" }],
      );
      return;
    }

    // Check notification permission (warning but not blocking)
    if (!notificationGranted) {
      Alert.alert(
        t("permissions"),
        "Notification permission was denied. You won't receive emergency alerts from group members. You can enable it later in settings.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Continue Anyway",
            onPress: () => router.replace("./group-setup"),
          },
        ],
      );
      return;
    }

    // Both permissions granted
    router.replace("./group-setup");
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Shield size={64} color="#FFFFFF" strokeWidth={2.5} />
            </View>
            <Text style={styles.title}>{t("welcome")}</Text>
            <Text style={styles.description}>{t("welcomeMessage")}</Text>
          </View>

          <View style={styles.featuresContainer}>
            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Users size={36} color="#0D7C66" strokeWidth={2.5} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{t("groupTracking")}</Text>
                <Text style={styles.featureDescription}>
                  Stay connected with your group members in real-time
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <AlertCircle size={36} color="#0D7C66" strokeWidth={2.5} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{t("emergencyHelp")}</Text>
                <Text style={styles.featureDescription}>
                  Quick access to emergency services and alerts
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <MapPin size={36} color="#0D7C66" strokeWidth={2.5} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{t("nearbyFacilities")}</Text>
                <Text style={styles.featureDescription}>
                  Find toilets, entrances, and prayer zones easily
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.permissionsInfo}>
            <Text style={styles.permissionsTitle}>{t("permissions")}</Text>

            <View style={styles.permissionItem}>
              <MapPin size={28} color="#0D7C66" strokeWidth={2.5} />
              <Text style={styles.permissionText}>
                {t("locationPermission")}
              </Text>
            </View>

            <View style={styles.permissionItem}>
              <Bell size={28} color="#0D7C66" strokeWidth={2.5} />
              <Text style={styles.permissionText}>
                {t("notificationPermission")}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            disabled={isRequesting}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>
              {isRequesting ? "Please wait..." : t("allowPermissions")}
            </Text>
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
  content: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#0D7C66",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#0D7C66",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "800" as const,
    color: "#1A1A1A",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 18,
    fontWeight: "500" as const,
    color: "#666666",
    textAlign: "center",
    lineHeight: 26,
    paddingHorizontal: 16,
  },
  featuresContainer: {
    gap: 16,
    marginBottom: 32,
  },
  featureCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E6F7F4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 15,
    fontWeight: "400" as const,
    color: "#666666",
    lineHeight: 20,
  },
  permissionsInfo: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  permissionsTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginBottom: 20,
  },
  permissionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  permissionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500" as const,
    color: "#333333",
    lineHeight: 22,
    marginLeft: 16,
  },
  continueButton: {
    backgroundColor: "#0D7C66",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#0D7C66",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  continueButtonText: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
});
