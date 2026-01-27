import { facilitiesData, Facility } from "@/constants/facilities";
import { getTranslation } from "@/constants/translations";
import { useApp } from "@/context/AppContext";
import {
  Accessibility,
  DoorOpen,
  Droplets,
  MapPin,
  Users,
} from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function FacilitiesScreen() {
  const { language, currentLocation } = useApp();
  const [selectedType, setSelectedType] = useState<string>("all");
  const scrollViewRef = useRef<ScrollView>(null);

  const t = (
    key: keyof typeof import("@/constants/translations").translations.en,
  ) => getTranslation(language, key);

  const calculateDistance = (facility: Facility): number => {
    if (!currentLocation) return 0;

    const lat1 = currentLocation.coords.latitude;
    const lon1 = currentLocation.coords.longitude;
    const lat2 = facility.latitude;
    const lon2 = facility.longitude;

    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
  };

  const openInGoogleMaps = (facility: Facility) => {
    const { latitude, longitude, name } = facility;
    const label = encodeURIComponent(name);

    // Different URL schemes for iOS and Android
    const scheme = Platform.select({
      ios: `maps:0,0?q=${label}@${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}(${label})`,
    });

    // Fallback to Google Maps web if native app is not available
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

    Alert.alert("Open in Maps", `Navigate to ${name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Open",
        onPress: async () => {
          try {
            const supported = await Linking.canOpenURL(scheme || url);
            if (supported && scheme) {
              await Linking.openURL(scheme);
            } else {
              await Linking.openURL(url);
            }
          } catch (error) {
            Alert.alert("Error", "Unable to open maps");
          }
        },
      },
    ]);
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "entrance":
        return DoorOpen;
      case "toilet":
        return Droplets;
      case "wheelchair":
        return Accessibility;
      case "zamzam":
        return Droplets;
      case "women":
        return Users;
      default:
        return MapPin;
    }
  };

  const getColorForType = (type: string): string => {
    switch (type) {
      case "entrance":
        return "#FF6B6B";
      case "toilet":
        return "#4ECDC4";
      case "wheelchair":
        return "#45B7D1";
      case "zamzam":
        return "#FFA07A";
      case "women":
        return "#98D8C8";
      default:
        return "#0D7C66";
    }
  };

  const filters = [
    { key: "all", label: "All", icon: MapPin },
    { key: "entrance", label: t("masjidEntrances"), icon: DoorOpen },
    { key: "toilet", label: t("toilets"), icon: Droplets },
    { key: "wheelchair", label: t("wheelchairPaths"), icon: Accessibility },
    { key: "zamzam", label: t("zamzamPoints"), icon: Droplets },
    { key: "women", label: t("womenZones"), icon: Users },
  ];

  const filteredFacilities =
    selectedType === "all"
      ? facilitiesData
      : facilitiesData.filter((f) => f.type === selectedType);

  const handleFilterChange = (filterKey: string, index: number) => {
    setSelectedType(filterKey);
    // Scroll to the selected filter chip
    scrollViewRef.current?.scrollTo({
      x: index * 120, // Approximate chip width
      animated: true,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.backgroundTop} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <MapPin size={40} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.headerTitle}>{t("nearbyPlaces")}</Text>
        </View>

        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
          keyboardShouldPersistTaps="handled"
        >
          {filters.map((filter, index) => {
            const isActive = selectedType === filter.key;

            return (
              <TouchableOpacity
                key={filter.key}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => handleFilterChange(filter.key, index)}
                activeOpacity={0.7}
              >
                <filter.icon
                  size={18}
                  color={isActive ? "#FFFFFF" : "#0D7C66"}
                  strokeWidth={2.3}
                />

                <Text
                  numberOfLines={1}
                  style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {filteredFacilities.map((facility) => {
            const Icon = getIconForType(facility.type);
            const color = getColorForType(facility.type);
            const distance = calculateDistance(facility);

            return (
              <TouchableOpacity
                key={facility.id}
                style={styles.facilityCard}
                activeOpacity={0.7}
                onPress={() => openInGoogleMaps(facility)}
              >
                <View style={[styles.facilityIcon, { backgroundColor: color }]}>
                  <Icon size={28} color="#FFFFFF" strokeWidth={2.5} />
                </View>
                <View style={styles.facilityInfo}>
                  <Text style={styles.facilityName}>{facility.name}</Text>
                  {facility.gateNumber && (
                    <Text style={styles.facilityGate}>
                      Gate {facility.gateNumber}
                    </Text>
                  )}
                  <Text style={styles.facilityDistance}>
                    {distance} {t("meters")}
                  </Text>
                </View>
                <MapPin size={20} color="#0D7C66" strokeWidth={2.5} />
              </TouchableOpacity>
            );
          })}
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
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    marginTop: 12,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#FFFFFF",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterChipActive: {
    backgroundColor: "#0D7C66",
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0D7C66",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 10,
  },
  facilityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 10,
    marginTop: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  facilityIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  facilityInfo: {
    flex: 1,
  },
  facilityName: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: "#1A1A1A",
    marginBottom: 4,
  },
  facilityGate: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#0D7C66",
    marginBottom: 4,
  },
  facilityDistance: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#666666",
  },
});
