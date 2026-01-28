import { getTranslation } from "@/constants/translations";
import { useApp } from "@/context/AppContext";
import { Tabs } from "expo-router";
import { BookOpen, Clock, Home, Map, MapPin } from "lucide-react-native";
import React from "react";

export default function TabLayout() {
  const { language } = useApp();

  const t = (
    key: keyof typeof import("@/constants/translations").translations.en,
  ) => getTranslation(language, key);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#0D7C66",
        tabBarInactiveTintColor: "#999999",
        headerShown: false,
        tabBarStyle: {
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E0E0E0",
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600" as const,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("home"),
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={size} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Live Map",
          tabBarIcon: ({ color, size }) => (
            <Map color={color} size={size} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="prayer"
        options={{
          title: "Qibla",
          tabBarIcon: ({ color, size }) => (
            <Clock color={color} size={size} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="duas"
        options={{
          title: t("duas"),
          tabBarIcon: ({ color, size }) => (
            <BookOpen color={color} size={size} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="facilities"
        options={{
          title: "Nearby",
          tabBarIcon: ({ color, size }) => (
            <MapPin color={color} size={size} strokeWidth={2.5} />
          ),
        }}
      />
    </Tabs>
  );
}
