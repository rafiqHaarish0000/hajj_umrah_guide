import { useApp } from "@/context/AppContext";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  View,
} from "react-native";

// ⛔ Prevent native splash from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function Index() {
  const router = useRouter();
  const { language, userName, groupCode, hasLocationPermission, isLoading } =
    useApp();

  const [appReady, setAppReady] = useState(false);

  // ✅ useRef prevents re-creation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const hasNavigated = useRef(false);
  // Play splash animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(async () => {
      setAppReady(true);
      await SplashScreen.hideAsync(); // ✅ hide native splash ONLY ONCE
    }, 2500);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim]);

  // Navigation AFTER splash + data load
  useEffect(() => {
    if (!appReady || isLoading || hasNavigated.current) return;

    hasNavigated.current = true; // ✅ Mark as navigated

    if (!language) {
      router.replace("/language-select");
    } else if (!hasLocationPermission) {
      router.replace("/permissions");
    } else if (!userName || !groupCode) {
      router.replace("/group-setup");
    } else {
      router.replace("/(tabs)");
    }
  }, [
    appReady,
    isLoading,
    language,
    userName,
    groupCode,
    hasLocationPermission,
    router,
  ]);

  // Always render splash UI first
  return (
    <View style={styles.splashContainer}>
      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={styles.splashIconCircle}>
          <Text style={styles.splashIconText}>نُسُك</Text>
        </View>

        <Text style={styles.splashAppName}>Nusuk Path</Text>
        <Text style={styles.tagline}>Your trusted path for Hajj & Umrah</Text>

        {!appReady && (
          <ActivityIndicator
            size="small"
            color="#FFFFFF"
            style={{ marginTop: 24 }}
          />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: "#0D7C66", // ✅ MUST NOT BE COMMENTED
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
  },
  splashIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  splashIconText: {
    fontSize: 36,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  splashAppName: {
    fontSize: 40,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  tagline: {
    fontSize: 14,
    marginTop: 8,
    color: "rgba(255,255,255,0.85)",
  },
});
