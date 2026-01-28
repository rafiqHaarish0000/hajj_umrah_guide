import { useApp } from "@/context/AppContext";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function Index() {
  const router = useRouter();
  const { language, userName, groupCode, hasLocationPermission, isLoading } =
    useApp();

  useEffect(() => {
    if (isLoading) {
      return; // Wait for data to load
    }

    // Navigation logic based on stored data
    if (!language) {
      router.replace("./language-select");
    } else if (!hasLocationPermission) {
      router.replace("./permissions");
    } else if (!userName || !groupCode) {
      router.replace("./group-setup");
    } else {
      // User is fully set up, go to home
      router.replace("./(tabs)");
    }
  }, [isLoading, language, userName, groupCode, hasLocationPermission]);

  // Show loading screen
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0D7C66" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
});
