import { getTranslation } from "@/constants/translations";
import { useApp } from "@/context/AppContext";
import {
    ArrowLeft,
    Clock,
    Footprints,
    MapPin,
    Navigation,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";

interface MapDirectionsScreenProps {
  destination: {
    latitude: number;
    longitude: number;
    name: string;
  };
  onBack: () => void;
}

export default function MapDirectionsScreen({
  destination,
  onBack,
}: MapDirectionsScreenProps) {
  const { language, currentLocation } = useApp();
  const mapRef = useRef<MapView>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<
    { latitude: number; longitude: number }[]
  >([]);
  const [distance, setDistance] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const t = (
    key: keyof typeof import("@/constants/translations").translations.en,
  ) => getTranslation(language ?? "en", key);

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // Fetch route from OpenRouteService API (free alternative to Google Directions)
  const fetchRoute = async () => {
    if (!currentLocation) return;

    try {
      setIsLoading(true);
      const start = `${currentLocation.coords.longitude},${currentLocation.coords.latitude}`;
      const end = `${destination.longitude},${destination.latitude}`;

      // Using OpenRouteService API (you'll need to get a free API key from openrouteservice.org)
      // Alternative: You can use OSRM (Open Source Routing Machine) which doesn't require API key
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/foot/${start};${end}?overview=full&geometries=geojson`,
      );

      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];

        // Convert coordinates from [lng, lat] to {latitude, longitude}
        const coordinates = route.geometry.coordinates.map(
          (coord: number[]) => ({
            latitude: coord[1],
            longitude: coord[0],
          }),
        );

        setRouteCoordinates(coordinates);
        setDistance(route.distance); // in meters
        setDuration(route.duration); // in seconds

        // Fit map to show entire route
        setTimeout(() => {
          mapRef.current?.fitToCoordinates(coordinates, {
            edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
            animated: true,
          });
        }, 500);
      } else {
        // Fallback: draw straight line if routing fails
        useStraightLineRoute();
      }
    } catch (error) {
      console.error("Error fetching route:", error);
      // Fallback: draw straight line
      useStraightLineRoute();
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback: Create a straight line route if API fails
  const useStraightLineRoute = () => {
    if (!currentLocation) return;

    const coords = [
      {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      },
      {
        latitude: destination.latitude,
        longitude: destination.longitude,
      },
    ];

    setRouteCoordinates(coords);

    const dist = calculateDistance(
      currentLocation.coords.latitude,
      currentLocation.coords.longitude,
      destination.latitude,
      destination.longitude,
    );

    setDistance(dist);
    // Estimate walking time: average walking speed 5 km/h = 1.4 m/s
    setDuration(dist / 1.4);

    setTimeout(() => {
      mapRef.current?.fitToCoordinates(coords, {
        edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
        animated: true,
      });
    }, 500);

    setIsLoading(false);
  };

  useEffect(() => {
    fetchRoute();
  }, [currentLocation, destination]);

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(2)} km`;
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
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

  const midPoint = {
    latitude: (currentLocation.coords.latitude + destination.latitude) / 2,
    longitude: (currentLocation.coords.longitude + destination.longitude) / 2,
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={{
          latitude: midPoint.latitude,
          longitude: midPoint.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {/* Route Polyline */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#0D7C66"
            strokeWidth={4}
            lineDashPattern={[1]}
          />
        )}

        {/* Destination Marker */}
        <Marker
          coordinate={{
            latitude: destination.latitude,
            longitude: destination.longitude,
          }}
          title={destination.name}
          pinColor="#FF6B6B"
        />

        {/* Current Location Marker */}
        <Marker
          coordinate={{
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          }}
          title="Your Location"
          pinColor="#0D7C66"
        />
      </MapView>

      <SafeAreaView style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color="#1A1A1A" strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {destination.name}
            </Text>
            <Text style={styles.headerSubtitle}>Directions</Text>
          </View>
        </View>

        {/* Route Info Card */}
        <View style={styles.routeInfoCard}>
          {isLoading ? (
            <View style={styles.loadingInfo}>
              <ActivityIndicator size="small" color="#0D7C66" />
              <Text style={styles.loadingInfoText}>Calculating route...</Text>
            </View>
          ) : (
            <>
              <View style={styles.routeInfoRow}>
                <View style={styles.infoItem}>
                  <Navigation size={20} color="#0D7C66" strokeWidth={2.5} />
                  <Text style={styles.infoLabel}>Distance</Text>
                  <Text style={styles.infoValue}>
                    {formatDistance(distance)}
                  </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoItem}>
                  <Clock size={20} color="#0D7C66" strokeWidth={2.5} />
                  <Text style={styles.infoLabel}>Est. Time</Text>
                  <Text style={styles.infoValue}>
                    {formatDuration(duration)}
                  </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoItem}>
                  <Footprints size={20} color="#0D7C66" strokeWidth={2.5} />
                  <Text style={styles.infoLabel}>Mode</Text>
                  <Text style={styles.infoValue}>Walking</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.startButton}
                onPress={() => {
                  // Center on user location
                  mapRef.current?.animateToRegion(
                    {
                      latitude: currentLocation.coords.latitude,
                      longitude: currentLocation.coords.longitude,
                      latitudeDelta: 0.005,
                      longitudeDelta: 0.005,
                    },
                    500,
                  );
                }}
                activeOpacity={0.7}
              >
                <Navigation size={20} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.startButtonText}>Start Navigation</Text>
              </TouchableOpacity>
            </>
          )}
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
    pointerEvents: "auto",
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  headerInfo: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#666666",
  },
  routeInfoCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
    pointerEvents: "auto",
  },
  loadingInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 20,
  },
  loadingInfoText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#666666",
  },
  routeInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  infoItem: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  divider: {
    width: 1,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 8,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: "#666666",
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#1A1A1A",
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0D7C66",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
    shadowColor: "#0D7C66",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#FFFFFF",
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
});
