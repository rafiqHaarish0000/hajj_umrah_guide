import { getTranslation } from "@/constants/translations";
import { useApp } from "@/context/AppContext";
import { useRouter } from "expo-router";
import { Bell, Edit, Pin, Plus, Smile, Trash2 } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const REACTION_EMOJIS = ["👍", "❤️", "✅", "🤲"];

export default function AnnouncementsScreen() {
  const router = useRouter();
  const {
    language,
    userName,
    isGroupLeader,
    groupLeaderName,
    announcements,
    createAnnouncement,
    editAnnouncement,
    deleteAnnouncement,
    toggleAnnouncementPin,
    addReactionToAnnouncement,
    removeReactionFromAnnouncement,
  } = useApp();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAnnouncementText, setNewAnnouncementText] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReactionsModal, setShowReactionsModal] = useState(false);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<
    string | null
  >(null);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<
    string | null
  >(null);

  const t = (
    key: keyof typeof import("@/constants/translations").translations.en,
  ) => getTranslation(language, key);

  const handleNewAnnouncement = () => {
    setShowCreateModal(true);
  };

  const handleSubmitAnnouncement = async () => {
    if (!newAnnouncementText.trim()) {
      Alert.alert("Error", "Please enter an announcement message");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingAnnouncementId) {
        // Edit existing announcement
        await editAnnouncement(
          editingAnnouncementId,
          newAnnouncementText,
          isPinned,
        );
        Alert.alert("Success", "Announcement updated successfully!");
      } else {
        // Create new announcement
        await createAnnouncement(newAnnouncementText, isPinned);
        Alert.alert("Success", "Announcement sent to all group members!");
      }
      setNewAnnouncementText("");
      setIsPinned(false);
      setEditingAnnouncementId(null);
      setShowCreateModal(false);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save announcement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePin = async (announcementId: string) => {
    try {
      await toggleAnnouncementPin(announcementId);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to toggle pin");
    }
  };

  const handleEditAnnouncement = (announcement: any) => {
    setEditingAnnouncementId(announcement.id);
    setNewAnnouncementText(announcement.message);
    setIsPinned(announcement.isPinned);
    setShowCreateModal(true);
  };

  const handleDeleteAnnouncement = (announcementId: string) => {
    Alert.alert(
      "Delete Announcement",
      "Are you sure you want to delete this announcement? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAnnouncement(announcementId);
              Alert.alert("Success", "Announcement deleted successfully");
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.message || "Failed to delete announcement",
              );
            }
          },
        },
      ],
    );
  };

  const handleReactionPress = (announcementId: string) => {
    setSelectedAnnouncementId(announcementId);
    setShowReactionsModal(true);
  };

  const handleSelectReaction = async (emoji: string) => {
    if (!selectedAnnouncementId) return;

    try {
      const announcement = announcements.find(
        (a) => a.id === selectedAnnouncementId,
      );
      const currentUserReaction = announcement?.reactions?.[userName || ""];

      if (currentUserReaction === emoji) {
        // Remove reaction if same emoji is selected
        await removeReactionFromAnnouncement(selectedAnnouncementId);
      } else {
        // Add or update reaction
        await addReactionToAnnouncement(selectedAnnouncementId, emoji);
      }

      setShowReactionsModal(false);
      setSelectedAnnouncementId(null);
    } catch (error: any) {
      Alert.alert("Error", "Failed to add reaction");
    }
  };

  const getReactionCounts = (reactions: { [key: string]: string } = {}) => {
    const counts: { [emoji: string]: number } = {};
    Object.values(reactions).forEach((emoji) => {
      counts[emoji] = (counts[emoji] || 0) + 1;
    });
    return counts;
  };

  return (
    <View style={styles.container}>
      <View style={styles.backgroundTop} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Bell size={40} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.headerTitle}>{t("announcements")}</Text>
          <Text style={styles.headerSubtitle}>
            {groupLeaderName
              ? `Group Leader: ${groupLeaderName}`
              : t("groupMessages")}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {announcements.length === 0 ? (
            <View style={styles.emptyState}>
              <Bell size={64} color="#CCCCCC" strokeWidth={2} />
              <Text style={styles.emptyStateText}>No announcements yet</Text>
              <Text style={styles.emptyStateSubtext}>
                {isGroupLeader
                  ? "Create your first announcement for the group"
                  : "Your group leader will post announcements here"}
              </Text>
            </View>
          ) : (
            announcements.map((announcement, index) => {
              const reactionCounts = getReactionCounts(announcement.reactions);
              const userReaction = announcement.reactions?.[userName || ""];

              return (
                <View
                  key={announcement.id}
                  style={[
                    styles.announcementCard,
                    announcement.isPinned && styles.pinnedCard,
                    index === 0 && styles.firstCard,
                  ]}
                >
                  {announcement.isPinned && (
                    <View style={styles.pinnedBadge}>
                      <Pin size={12} color="#FFFFFF" />
                      <Text style={styles.pinnedText}>{t("pinned")}</Text>
                    </View>
                  )}

                  <View style={styles.cardHeader}>
                    <View style={styles.leaderInfo}>
                      <View style={styles.leaderAvatar}>
                        <Text style={styles.leaderInitial}>
                          {announcement.leaderName.charAt(0)}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.leaderName}>
                          {announcement.leaderName}
                        </Text>
                        <Text style={styles.leaderRole}>
                          {t("groupLeader")}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.timeInfo}>
                      <Text style={styles.timeDate}>{announcement.date}</Text>
                      <Text style={styles.timeHour}>{announcement.time}</Text>
                    </View>
                  </View>

                  <Text style={styles.messageText}>{announcement.message}</Text>

                  {/* Reactions Display */}
                  {Object.keys(reactionCounts).length > 0 && (
                    <View style={styles.reactionsDisplay}>
                      {Object.entries(reactionCounts).map(([emoji, count]) => (
                        <View key={emoji} style={styles.reactionBadge}>
                          <Text style={styles.reactionEmoji}>{emoji}</Text>
                          <Text style={styles.reactionCount}>{count}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Action Buttons */}
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[
                        styles.reactionButton,
                        userReaction && styles.reactionButtonActive,
                      ]}
                      onPress={() => handleReactionPress(announcement.id)}
                    >
                      {userReaction ? (
                        <Text style={styles.reactionButtonEmoji}>
                          {userReaction}
                        </Text>
                      ) : (
                        <Smile size={20} color="#0D7C66" />
                      )}
                      <Text style={styles.reactionButtonText}>
                        {userReaction ? "Change" : "React"}
                      </Text>
                    </TouchableOpacity>

                    {isGroupLeader && (
                      <TouchableOpacity
                        style={styles.pinButton}
                        onPress={() => handleTogglePin(announcement.id)}
                      >
                        <Pin
                          size={20}
                          color={announcement.isPinned ? "#FFA726" : "#666666"}
                          fill={announcement.isPinned ? "#FFA726" : "none"}
                        />
                        <Text style={styles.pinButtonText}>
                          {announcement.isPinned ? "Unpin" : "Pin"}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Leader Actions - Edit & Delete */}
                  {isGroupLeader && (
                    <View style={styles.leaderActions}>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleEditAnnouncement(announcement)}
                      >
                        <Edit size={18} color="#0D7C66" />
                        <Text style={styles.editButtonText}>Edit</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() =>
                          handleDeleteAnnouncement(announcement.id)
                        }
                      >
                        <Trash2 size={18} color="#DC3545" />
                        <Text style={styles.deleteButtonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>

        {isGroupLeader && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.newAnnouncementButton}
              onPress={handleNewAnnouncement}
              activeOpacity={0.8}
            >
              <Plus size={24} color="#FFFFFF" strokeWidth={3} />
              <Text style={styles.buttonText}>{t("newAnnouncement")}</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>

      {/* Create Announcement Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalOverlay}
            onPress={() => {
              setShowCreateModal(false);
              setNewAnnouncementText("");
              setIsPinned(false);
              setEditingAnnouncementId(null);
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={styles.modalContentWrapper}
              onPress={(e) => e.stopPropagation()}
            >
              <ScrollView
                contentContainerStyle={styles.modalScrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>
                    {editingAnnouncementId
                      ? "Edit Announcement"
                      : "New Announcement"}
                  </Text>

                  <TextInput
                    style={styles.modalInput}
                    placeholder="Enter your announcement message..."
                    placeholderTextColor="#999999"
                    value={newAnnouncementText}
                    onChangeText={setNewAnnouncementText}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                    maxLength={500}
                  />

                  <TouchableOpacity
                    style={styles.pinToggle}
                    onPress={() => setIsPinned(!isPinned)}
                  >
                    <Pin
                      size={20}
                      color={isPinned ? "#FFA726" : "#666666"}
                      fill={isPinned ? "#FFA726" : "none"}
                    />
                    <Text style={styles.pinToggleText}>
                      {isPinned
                        ? "Pinned (will appear at top)"
                        : "Pin this announcement"}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={styles.modalCancelButton}
                      onPress={() => {
                        setShowCreateModal(false);
                        setNewAnnouncementText("");
                        setIsPinned(false);
                        setEditingAnnouncementId(null);
                      }}
                    >
                      <Text style={styles.modalCancelButtonText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.modalSubmitButton,
                        isSubmitting && styles.modalSubmitButtonDisabled,
                      ]}
                      onPress={handleSubmitAnnouncement}
                      disabled={isSubmitting}
                    >
                      <Text style={styles.modalSubmitButtonText}>
                        {isSubmitting
                          ? editingAnnouncementId
                            ? "Updating..."
                            : "Sending..."
                          : editingAnnouncementId
                            ? "Update"
                            : "Send"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Reactions Modal */}
      <Modal
        visible={showReactionsModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowReactionsModal(false)}
      >
        <TouchableOpacity
          style={styles.reactionsModalOverlay}
          activeOpacity={1}
          onPress={() => setShowReactionsModal(false)}
        >
          <View style={styles.reactionsModalContent}>
            <Text style={styles.reactionsModalTitle}>
              React to announcement
            </Text>
            <View style={styles.reactionsGrid}>
              {REACTION_EMOJIS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={styles.reactionOption}
                  onPress={() => handleSelectReaction(emoji)}
                >
                  <Text style={styles.reactionOptionEmoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
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
    height: 220,
    backgroundColor: "#0D7C66",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    marginTop: 12,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: "rgba(255, 255, 255, 0.85)",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  firstCard: {
    marginTop: 8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#666666",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 16,
    fontWeight: "400" as const,
    color: "#999999",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  announcementCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  pinnedCard: {
    backgroundColor: "#FFF9F0",
    borderWidth: 2,
    borderColor: "#FFA726",
  },
  pinnedBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "#FFA726",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  pinnedText: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    paddingRight: 80,
  },
  leaderInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  leaderAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#0D7C66",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  leaderInitial: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  leaderName: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginBottom: 2,
  },
  leaderRole: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#0D7C66",
  },
  timeInfo: {
    alignItems: "flex-end",
  },
  timeDate: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#666666",
    marginBottom: 2,
  },
  timeHour: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: "#1A1A1A",
  },
  messageText: {
    fontSize: 17,
    fontWeight: "500" as const,
    color: "#1A1A1A",
    lineHeight: 28,
    marginBottom: 16,
  },
  reactionsDisplay: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  reactionBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  reactionEmoji: {
    fontSize: 18,
  },
  reactionCount: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1A1A1A",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    paddingTop: 16,
  },
  reactionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  reactionButtonActive: {
    backgroundColor: "#E6F7F4",
    borderWidth: 1,
    borderColor: "#0D7C66",
  },
  reactionButtonEmoji: {
    fontSize: 20,
  },
  reactionButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#0D7C66",
  },
  pinButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  pinButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#666666",
  },
  leaderActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E6F7F4",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: "#0D7C66",
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#0D7C66",
  },
  deleteButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF5F5",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: "#DC3545",
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#DC3545",
  },
  bottomSpacer: {
    height: 20,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  newAnnouncementButton: {
    flexDirection: "row",
    backgroundColor: "#0D7C66",
    borderRadius: 16,
    paddingVertical: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0D7C66",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContentWrapper: {
    maxHeight: "90%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalScrollContent: {
    flexGrow: 1,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: "#1A1A1A",
    minHeight: 150,
    marginBottom: 16,
  },
  pinToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    marginBottom: 24,
  },
  pinToggleText: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: "#1A1A1A",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#666666",
  },
  modalSubmitButton: {
    flex: 1,
    backgroundColor: "#0D7C66",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  modalSubmitButtonDisabled: {
    backgroundColor: "#9EBFB8",
  },
  modalSubmitButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  reactionsModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  reactionsModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    width: "80%",
  },
  reactionsModalTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginBottom: 20,
    textAlign: "center",
  },
  reactionsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  reactionOption: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 30,
  },
  reactionOptionEmoji: {
    fontSize: 32,
  },
});
