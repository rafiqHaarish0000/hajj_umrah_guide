import { getTranslation } from "@/constants/translations";
import { useApp } from "@/context/AppContext";
import { useRouter } from "expo-router";
import { AlertCircle, Phone, X } from "lucide-react-native";
import React from "react";
import {
  Alert,
  Linking,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function PanicScreen() {
  const router = useRouter();
  const { language, sendPanicAlert } = useApp();

  const t = (
    key: keyof typeof import("@/constants/translations").translations.en,
  ) => getTranslation(language ?? "en", key);

  const handleConfirmPanic = () => {
    Alert.alert(
      t("sendAlert"),
      "This will send your location to all group members",
      [
        {
          text: t("cancel"),
          style: "cancel",
        },
        {
          text: t("confirm"),
          style: "destructive",
          onPress: async () => {
            await sendPanicAlert();
            Alert.alert(
              "Alert Sent",
              "Emergency alert has been sent to your group members",
            );
            router.back();
          },
        },
      ],
    );
  };

  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  const emergencyContacts = [
    {
      id: "police",
      name: t("saudiPolice"),
      number: "999",
      color: "#DC3545",
    },
    {
      id: "ambulance",
      name: t("ambulance"),
      number: "997",
      color: "#FF6B6B",
    },
    {
      id: "hajj",
      name: t("hajjHelpDesk"),
      number: "920000814",
      color: "#FFA07A",
    },
  ];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>{t("emergency")}</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <X size={28} color="#1A1A1A" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.alertSection}>
            <View style={styles.alertIcon}>
              <AlertCircle size={64} color="#DC3545" strokeWidth={3} />
            </View>
            <Text style={styles.alertTitle}>Send Emergency Alert</Text>
            <Text style={styles.alertDescription}>
              Your location will be shared with all group members immediately
            </Text>
            <TouchableOpacity
              style={styles.panicButton}
              onPress={handleConfirmPanic}
              activeOpacity={0.8}
            >
              <AlertCircle size={24} color="#FFFFFF" strokeWidth={3} />
              <Text style={styles.panicButtonText}>SEND ALERT TO GROUP</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR CALL</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.contactsSection}>
            <Text style={styles.sectionTitle}>{t("emergencyContacts")}</Text>
            {emergencyContacts.map((contact) => (
              <TouchableOpacity
                key={contact.id}
                style={[styles.contactCard, { borderLeftColor: contact.color }]}
                onPress={() => handleCall(contact.number)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.contactIcon,
                    { backgroundColor: contact.color },
                  ]}
                >
                  <Phone size={28} color="#FFFFFF" strokeWidth={2.5} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactNumber}>{contact.number}</Text>
                </View>
                <Phone size={20} color={contact.color} strokeWidth={2.5} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
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
    flex: 1,
    paddingHorizontal: 24,
  },
  alertSection: {
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
  alertIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFE5E8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  alertTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginBottom: 12,
    textAlign: "center",
  },
  alertDescription: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: "#666666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  panicButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DC3545",
    paddingHorizontal: 32,
    paddingVertical: 20,
    borderRadius: 16,
    gap: 12,
    shadowColor: "#DC3545",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    width: "100%",
  },
  panicButtonText: {
    fontSize: 18,
    fontWeight: "800" as const,
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  dividerText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#999999",
  },
  contactsSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginBottom: 16,
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  contactIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1A1A1A",
    marginBottom: 4,
  },
  contactNumber: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: "#666666",
  },
});
