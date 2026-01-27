import { useApp } from "@/context/AppContext";
import { useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

export default function Index() {
  const router = useRouter();
  const segments = useSegments();
  const { language, userName, groupCode, hasLocationPermission, isLoading } =
    useApp();

  useEffect(() => {
    if (isLoading) return;

    if (!language || language === "en") {
      router.replace("./language-select");
    } else if (!hasLocationPermission) {
      router.replace("./permissions");
    } else if (!userName || !groupCode) {
      router.replace("./group-setup");
    } else {
      router.replace("./(tabs)");
    }
  }, [isLoading, language, userName, groupCode, hasLocationPermission]);

  return null;
}
