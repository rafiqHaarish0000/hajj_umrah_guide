import { getTranslation } from "@/constants/translations";
import { useApp } from "@/context/AppContext";
import { useRouter } from "expo-router";
import { Share2, UserPlus, Users } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function GroupSetupScreen() {
  const router = useRouter();
  const { language, userName, saveUserName, createGroup, joinGroup } = useApp();
  const [name, setName] = useState<string>(userName || "");
  const [groupCodeInput, setGroupCodeInput] = useState<string>("");
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [showNameInput, setShowNameInput] = useState<boolean>(!userName);
  const [isJoining, setIsJoining] = useState<boolean>(false);

  const t = (
    key: keyof typeof import("@/constants/translations").translations.en,
  ) => getTranslation(language, key);

  const handleSaveName = async () => {
    if (!name.trim()) {
      Alert.alert("Name Required", "Please enter your name to continue");
      return;
    }
    await saveUserName(name.trim());
    setShowNameInput(false);
  };

  const handleCreateGroup = async () => {
    if (!userName) {
      setShowNameInput(true);
      return;
    }

    try {
      const code = await createGroup();
      setGeneratedCode(code);
    } catch (error) {
      Alert.alert("Error", "Failed to create group. Please try again.");
    }
  };

  const handleJoinGroup = async () => {
    if (!userName) {
      setShowNameInput(true);
      return;
    }

    if (!groupCodeInput.trim()) {
      Alert.alert("Invalid Code", "Please enter a group code");
      return;
    }

    if (groupCodeInput.length !== 6) {
      Alert.alert("Invalid Code", "Group code must be 6 digits");
      return;
    }

    // Validate that the code contains only numbers
    if (!/^\d{6}$/.test(groupCodeInput.trim())) {
      Alert.alert("Invalid Code", "Group code must contain only numbers");
      return;
    }

    setIsJoining(true);

    try {
      await joinGroup(groupCodeInput.trim());
      // Successfully joined - navigate to main app
      router.replace("./(tabs)");
    } catch (error: any) {
      setIsJoining(false);

      if (error.message === "GROUP_NOT_FOUND") {
        Alert.alert(
          "Group Not Found",
          `The group code "${groupCodeInput}" does not exist. Please check the code or create a new group.`,
          [
            { text: "Try Again", style: "default" },
            {
              text: "Create New Group",
              style: "default",
              onPress: handleCreateGroup,
            },
          ],
        );
      } else if (error.message === "INVALID_CODE") {
        Alert.alert("Invalid Code", "Please enter a valid 6-digit group code", [
          { text: "OK" },
        ]);
      } else {
        Alert.alert(
          "Error",
          "Failed to join group. Please check your connection and try again.",
          [{ text: "OK" }],
        );
      }
    }
  };

  const handleShareCode = async () => {
    try {
      await Share.share({
        message: `Join my Hajj/Umrah group! Use this code: ${generatedCode}\n\nDownload the app and enter this code to join.`,
      });
    } catch (error) {
      console.error("Error sharing code:", error);
    }
  };

  const handleContinueWithGroup = () => {
    router.replace("./(tabs)");
  };

  if (showNameInput) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Users size={56} color="#FFFFFF" strokeWidth={2.5} />
              </View>
              <Text style={styles.title}>{t("userName")}</Text>
              <Text style={styles.subtitle}>
                This name will be visible to your group members
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder={t("enterName")}
                placeholderTextColor="#999999"
                value={name}
                onChangeText={setName}
                autoFocus
                maxLength={30}
              />
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleSaveName}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>{t("continue")}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (generatedCode) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.successIconContainer}>
                <Users size={56} color="#0D7C66" strokeWidth={2.5} />
              </View>
              <Text style={styles.title}>Group Created!</Text>
              <Text style={styles.subtitle}>
                Share this code with your group members
              </Text>
            </View>

            <View style={styles.codeContainer}>
              <Text style={styles.codeLabel}>{t("groupCode")}</Text>
              <Text style={styles.codeText}>{generatedCode}</Text>
            </View>

            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShareCode}
              activeOpacity={0.8}
            >
              <Share2 size={24} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.shareButtonText}>{t("shareCode")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleContinueWithGroup}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>{t("continue")}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Users size={56} color="#FFFFFF" strokeWidth={2.5} />
            </View>
            <Text style={styles.title}>{t("joinOrCreate")}</Text>
            <Text style={styles.subtitle}>
              Stay connected with your pilgrimage group
            </Text>
          </View>

          <View style={styles.optionsContainer}>
            <View style={styles.optionCard}>
              <View style={styles.optionHeader}>
                <UserPlus size={32} color="#0D7C66" strokeWidth={2.5} />
                <Text style={styles.optionTitle}>{t("joinGroup")}</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder={t("enterGroupCode")}
                placeholderTextColor="#999999"
                value={groupCodeInput}
                onChangeText={setGroupCodeInput}
                keyboardType="number-pad"
                maxLength={6}
                editable={!isJoining}
              />
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  isJoining && styles.optionButtonDisabled,
                ]}
                onPress={handleJoinGroup}
                activeOpacity={0.8}
                disabled={isJoining}
              >
                {isJoining ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.optionButtonText}>{t("joinGroup")}</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.optionCard}>
              <View style={styles.optionHeader}>
                <Users size={32} color="#0D7C66" strokeWidth={2.5} />
                <Text style={styles.optionTitle}>{t("createGroup")}</Text>
              </View>
              <Text style={styles.optionDescription}>
                Create a new group and get a code to share with others
              </Text>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={handleCreateGroup}
                activeOpacity={0.8}
              >
                <Text style={styles.optionButtonText}>{t("createGroup")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#0D7C66",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#0D7C66",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E6F7F4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: "#1A1A1A",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: "#666666",
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1A1A1A",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    textAlign: "center",
  },
  primaryButton: {
    backgroundColor: "#0D7C66",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#0D7C66",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  optionsContainer: {
    gap: 24,
  },
  optionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  optionTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: "#1A1A1A",
  },
  optionDescription: {
    fontSize: 15,
    fontWeight: "400" as const,
    color: "#666666",
    marginBottom: 16,
    lineHeight: 20,
  },
  optionButton: {
    backgroundColor: "#0D7C66",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
    minHeight: 56,
    justifyContent: "center",
  },
  optionButtonDisabled: {
    backgroundColor: "#9EBFB8",
  },
  optionButtonText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  dividerText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#999999",
  },
  codeContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  codeLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#666666",
    marginBottom: 12,
  },
  codeText: {
    fontSize: 48,
    fontWeight: "800" as const,
    color: "#0D7C66",
    letterSpacing: 8,
  },
  shareButton: {
    backgroundColor: "#0D7C66",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 16,
    shadowColor: "#0D7C66",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  shareButtonText: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#0D7C66",
  },
  secondaryButtonText: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#0D7C66",
  },
});
