import { duasData } from "@/constants/duas";
import { getTranslation } from "@/constants/translations";
import { useApp } from "@/context/AppContext";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react-native";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function DuasScreen() {
  const { language } = useApp();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const t = (
    key: keyof typeof import("@/constants/translations").translations.en,
  ) => getTranslation(language ?? "en", key);

  const categories = [
    { key: "ihram" as const, title: t("ihramDuas") },
    { key: "tawaf" as const, title: t("tawafDuas") },
    { key: "sai" as const, title: t("saiDuas") },
    { key: "general" as const, title: t("generalDuas") },
  ];

  const handleToggle = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <View style={styles.container}>
      <View style={styles.backgroundTop} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <BookOpen size={40} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.headerTitle}>{t("duas")}</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {categories.map((category) => (
            <View key={category.key} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{category.title}</Text>
              {duasData
                .filter((dua) => dua.category === category.key)
                .map((dua) => (
                  <TouchableOpacity
                    key={dua.id}
                    style={styles.duaCard}
                    onPress={() => handleToggle(dua.id)}
                    activeOpacity={0.9}
                  >
                    <View style={styles.duaHeader}>
                      <Text style={styles.duaArabic}>{dua.arabic}</Text>
                      {expandedId === dua.id ? (
                        <ChevronUp
                          size={24}
                          color="#0D7C66"
                          strokeWidth={2.5}
                        />
                      ) : (
                        <ChevronDown
                          size={24}
                          color="#0D7C66"
                          strokeWidth={2.5}
                        />
                      )}
                    </View>

                    {expandedId === dua.id && (
                      <View style={styles.duaContent}>
                        <View style={styles.duaSection}>
                          <Text style={styles.duaLabel}>Transliteration</Text>
                          <Text style={styles.duaTransliteration}>
                            {dua.transliteration}
                          </Text>
                        </View>

                        <View style={styles.duaSection}>
                          <Text style={styles.duaLabel}>Translation</Text>
                          <Text style={styles.duaTranslation}>
                            {dua.translation[language as "en" | "ta" | "ur"] ??
                              dua.translation.en}
                          </Text>
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
            </View>
          ))}
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
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    marginTop: 12,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  categorySection: {
    marginBottom: 32,
  },
  categoryTitle: {
    marginTop: 28,
    fontSize: 22,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginBottom: 16,
  },
  duaCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  duaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  duaArabic: {
    flex: 1,
    fontSize: 22,
    fontWeight: "600" as const,
    color: "#1A1A1A",
    lineHeight: 36,
    textAlign: "right",
    marginRight: 12,
  },
  duaContent: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  duaSection: {
    marginBottom: 16,
  },
  duaLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#0D7C66",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  duaTransliteration: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: "#666666",
    lineHeight: 24,
    fontStyle: "italic" as const,
  },
  duaTranslation: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: "#1A1A1A",
    lineHeight: 24,
  },
});
