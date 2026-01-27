// template
import { AppProvider } from "@/context/AppContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="language-select" options={{ headerShown: false }} />
      <Stack.Screen name="permissions" options={{ headerShown: false }} />
      <Stack.Screen name="group-setup" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="profile"
        options={{ headerShown: false, presentation: "modal" }}
      />
      <Stack.Screen
        name="panic"
        options={{ headerShown: false, presentation: "modal" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <GestureHandlerRootView>
          <RootLayoutNav />
        </GestureHandlerRootView>
      </AppProvider>
    </QueryClientProvider>
  );
}
