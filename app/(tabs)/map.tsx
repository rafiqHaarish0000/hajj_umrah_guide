import { getTranslation } from "@/constants/translations";
import { useApp } from "@/context/AppContext";
import { MapPin, Navigation, Users } from "lucide-react-native";
import React from "react";
import {
  Alert,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";

export default function MapScreen() {
  const {
    language,
    currentLocation,
    groupMembers,
    userName,
    meetingPoint,
    setMeetingPointLocation,
    simulateGroupMembers,
  } = useApp();

  const t = (
    key: keyof typeof import("@/constants/translations").translations.en,
  ) => getTranslation(language, key);

  const handleSetMeetingPoint = () => {
    if (!currentLocation) return;

    Alert.alert(
      t("setMeetingPoint"),
      "Set your current location as the meeting point?",
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("confirm"),
          onPress: () => {
            setMeetingPointLocation({
              latitude: currentLocation.coords.latitude,
              longitude: currentLocation.coords.longitude,
            });
            Alert.alert(
              "Success",
              "Meeting point has been set and shared with group",
            );
          },
        },
      ],
    );
  };

  if (!currentLocation) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <MapPin size={48} color="#0D7C66" strokeWidth={2.5} />
            <Text style={styles.loadingText}>Loading your location...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const region = {
    latitude: currentLocation.coords.latitude,
    longitude: currentLocation.coords.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton
      >
        {groupMembers.map((member) => (
          <Marker
            key={member.id}
            coordinate={{
              latitude: member.latitude,
              longitude: member.longitude,
            }}
            title={member.name}
            description={`Last updated: ${new Date(member.lastUpdate).toLocaleTimeString()}`}
            pinColor={member.color}
          />
        ))}

        {meetingPoint && (
          <Marker
            coordinate={meetingPoint}
            title={userName ? `${userName}'s Meeting Point` : "Meeting Point"}
            description="Group meeting location"
            pinColor="#FFD700"
          />
        )}
      </MapView>

      <SafeAreaView style={styles.overlay} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <View style={styles.headerCard}>
            <Users size={20} color="#0D7C66" strokeWidth={2.5} />
            <Text style={styles.headerText}>
              {groupMembers.length} {t("groupMembers")}
            </Text>
          </View>
        </View>

        <View style={styles.bottomControls}>
          <View style={styles.infoCard}>
            <MapPin size={16} color="#666666" strokeWidth={2.5} />
            <Text style={styles.infoText}>{t("updateEvery2Min")}</Text>
          </View>

          <TouchableOpacity
            style={styles.meetingButton}
            onPress={handleSetMeetingPoint}
            activeOpacity={0.7}
          >
            <Navigation size={20} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.meetingButtonText}>{t("setMeetingPoint")}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    gap: 16,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#666666",
  },
  map: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "box-none",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.select({ ios: 16, android: 16 }),
    pointerEvents: "box-none",
  },
  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    gap: 8,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1A1A1A",
  },
  bottomControls: {
    position: "absolute",
    bottom: Platform.select({ ios: 100, android: 90 }),
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    gap: 12,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#666666",
  },
  meetingButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0D7C66",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
    shadowColor: "#0D7C66",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  meetingButtonText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
});
