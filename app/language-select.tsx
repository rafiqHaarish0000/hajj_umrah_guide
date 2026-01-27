import { Language } from "@/constants/translations";
import { useApp } from "@/context/AppContext";
import { useRouter } from "expo-router";
import React from "react";
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function LanguageSelectScreen() {
  const router = useRouter();
  const { changeLanguage } = useApp();

  const handleLanguageSelect = async (lang: Language) => {
    await changeLanguage(lang);
    router.replace("./permissions");
  };

  const languages = [
    { code: "ar" as Language, name: "العربية", nativeName: "Arabic" },
    { code: "en" as Language, name: "English", nativeName: "English" },
    { code: "ta" as Language, name: "தமிழ்", nativeName: "Tamil" },
    { code: "ur" as Language, name: "اردو", nativeName: "Urdu" },
  ];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>🕋</Text>
            </View>
            <Text style={styles.title}>Hajj & Umrah Guide</Text>
            <Text style={styles.subtitle}>Select Your Language</Text>
          </View>

          <View style={styles.languageContainer}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={styles.languageButton}
                onPress={() => handleLanguageSelect(lang.code)}
                activeOpacity={0.8}
              >
                <Text style={styles.languageText}>{lang.name}</Text>
                <Text style={styles.languageSubtext}>{lang.nativeName}</Text>
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
    backgroundColor: "#0D7C66",
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 60,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  logoText: {
    fontSize: 56,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "500" as const,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  languageContainer: {
    gap: 16,
  },
  languageButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  languageText: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#0D7C66",
    marginBottom: 4,
  },
  languageSubtext: {
    fontSize: 18,
    fontWeight: "500" as const,
    color: "#41B3A3",
  },
});
