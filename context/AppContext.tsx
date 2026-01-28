import { database } from "@/config/firebase";
import { Language } from "@/constants/translations";
import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import {
  get,
  off,
  onValue,
  push,
  ref,
  remove,
  set,
  update,
} from "firebase/database";
import { useEffect, useState } from "react";

export interface GroupMember {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  lastUpdate: number;
  color: string;
}

export interface Announcement {
  id: string;
  leaderName: string;
  time: string;
  date: string;
  message: string;
  isPinned: boolean;
  timestamp: number;
  reactions?: {
    [userId: string]: string; // userId: emoji
  };
}

export interface AppState {
  language: Language;
  userName: string | null;
  groupCode: string | null;
  isGroupLeader: boolean;
  groupLeaderName: string | null;
  hasLocationPermission: boolean;
  hasNotificationPermission: boolean;
  currentLocation: Location.LocationObject | null;
  groupMembers: GroupMember[];
  meetingPoint: { latitude: number; longitude: number } | null;
  announcements: Announcement[];
}

const COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#FFA07A",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E2",
];

export const [AppProvider, useApp] = createContextHook(() => {
  const [language, setLanguage] = useState<Language>("en");
  const [userName, setUserName] = useState<string | null>(null);
  const [groupCode, setGroupCode] = useState<string | null>(null);
  const [isGroupLeader, setIsGroupLeader] = useState<boolean>(false);
  const [groupLeaderName, setGroupLeaderName] = useState<string | null>(null);
  const [hasLocationPermission, setHasLocationPermission] =
    useState<boolean>(false);
  const [hasNotificationPermission, setHasNotificationPermission] =
    useState<boolean>(false);
  const [currentLocation, setCurrentLocation] =
    useState<Location.LocationObject | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [meetingPoint, setMeetingPoint] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadStoredData();
  }, []);

  useEffect(() => {
    if (hasLocationPermission && groupCode && userName) {
      startLocationTracking();
    }
  }, [hasLocationPermission, groupCode, userName]);

  useEffect(() => {
    // Listen to group updates when we have a group code
    if (groupCode) {
      listenToGroupUpdates(groupCode);
    }

    // Cleanup listeners on unmount or when group code changes
    return () => {
      if (groupCode) {
        cleanupListeners(groupCode);
      }
    };
  }, [groupCode]);

  const loadStoredData = async () => {
    try {
      const storedLanguage = await AsyncStorage.getItem("language");
      const storedUserName = await AsyncStorage.getItem("userName");
      const storedGroupCode = await AsyncStorage.getItem("groupCode");
      const storedIsGroupLeader = await AsyncStorage.getItem("isGroupLeader");

      if (storedLanguage) setLanguage(storedLanguage as Language);
      if (storedUserName) setUserName(storedUserName);
      if (storedGroupCode) setGroupCode(storedGroupCode);
      if (storedIsGroupLeader) setIsGroupLeader(storedIsGroupLeader === "true");

      const locationPermission = await Location.getForegroundPermissionsAsync();
      setHasLocationPermission(locationPermission.granted);

      const notificationPermission = await Notifications.getPermissionsAsync();
      setHasNotificationPermission(notificationPermission.granted);
    } catch (error) {
      console.error("Error loading stored data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const startLocationTracking = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setCurrentLocation(location);
      updateUserLocationInGroup(location);

      // Watch position and update Firebase every 2 minutes or 50 meters
      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 120000, // 2 minutes
          distanceInterval: 50, // 50 meters
        },
        (location) => {
          setCurrentLocation(location);
          updateUserLocationInGroup(location);
        },
      );
    } catch (error) {
      console.error("Error tracking location:", error);
    }
  };

  /**
   * Update user's location in Firebase Realtime Database
   */
  const updateUserLocationInGroup = async (
    location: Location.LocationObject,
  ) => {
    if (!userName || !groupCode) return;

    try {
      const memberRef = ref(
        database,
        `groups/${groupCode}/members/${userName}`,
      );
      await set(memberRef, {
        name: userName,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        lastUpdate: Date.now(),
      });

      console.log("Location updated in Firebase:", {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error("Error updating location in Firebase:", error);
    }
  };

  /**
   * Format timestamp to readable date and time
   */
  const formatAnnouncementTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    let dateStr = "Today";
    if (diffDays === 1) dateStr = "Yesterday";
    else if (diffDays > 1) dateStr = date.toLocaleDateString();

    const timeStr = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    return { date: dateStr, time: timeStr };
  };

  /**
   * Listen to real-time updates from Firebase for group members, meeting point, and announcements
   */
  const listenToGroupUpdates = (code: string) => {
    console.log("Setting up Firebase listeners for group:", code);

    // Listen to group info (including leader name)
    const groupInfoRef = ref(database, `groups/${code}`);
    onValue(groupInfoRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.createdBy) {
        setGroupLeaderName(data.createdBy);
      }
    });

    // Listen to group members
    const membersRef = ref(database, `groups/${code}/members`);
    onValue(membersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const members: GroupMember[] = Object.entries(data).map(
          ([id, member]: any, index) => ({
            id,
            name: member.name,
            latitude: member.latitude || 0,
            longitude: member.longitude || 0,
            lastUpdate: member.lastUpdate || Date.now(),
            color: COLORS[index % COLORS.length],
          }),
        );
        console.log("Group members updated:", members.length);
        setGroupMembers(members);
      } else {
        setGroupMembers([]);
      }
    });

    // Listen to meeting point
    const meetingPointRef = ref(database, `groups/${code}/meetingPoint`);
    onValue(meetingPointRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        console.log("Meeting point updated:", data);
        setMeetingPoint({
          latitude: data.latitude,
          longitude: data.longitude,
        });
      } else {
        setMeetingPoint(null);
      }
    });

    // Listen to announcements
    const announcementsRef = ref(database, `groups/${code}/announcements`);
    onValue(announcementsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const announcementsList: Announcement[] = Object.entries(data).map(
          ([id, announcement]: any) => {
            const { date, time } = formatAnnouncementTime(
              announcement.timestamp,
            );
            return {
              id,
              leaderName: announcement.leaderName,
              message: announcement.message,
              isPinned: announcement.isPinned || false,
              timestamp: announcement.timestamp,
              date,
              time,
              reactions: announcement.reactions || {},
            };
          },
        );

        // Sort by timestamp (newest first) and pinned first
        announcementsList.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return b.timestamp - a.timestamp;
        });

        console.log("Announcements updated:", announcementsList.length);
        setAnnouncements(announcementsList);

        // Show notification for new announcements (not from current user)
        const latestAnnouncement = announcementsList[0];
        if (latestAnnouncement && latestAnnouncement.leaderName !== userName) {
          const timeSincePost = Date.now() - latestAnnouncement.timestamp;
          // Only notify if announcement is less than 10 seconds old (recent)
          if (timeSincePost < 10000) {
            Notifications.scheduleNotificationAsync({
              content: {
                title: `📢 ${latestAnnouncement.leaderName}`,
                body: latestAnnouncement.message,
                data: { type: "announcement" },
              },
              trigger: null,
            });
          }
        }
      } else {
        setAnnouncements([]);
      }
    });

    // Listen to alerts/panic notifications
    const alertsRef = ref(database, `groups/${code}/alerts`);
    onValue(alertsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Get the latest alert
        const alerts = Object.values(data) as any[];
        const latestAlert = alerts[alerts.length - 1];

        if (latestAlert && latestAlert.from !== userName) {
          // Show notification for alerts from other users
          Notifications.scheduleNotificationAsync({
            content: {
              title: latestAlert.title || "Group Alert",
              body: latestAlert.message,
              data: { type: latestAlert.type },
            },
            trigger: null, // Show immediately
          });
        }
      }
    });
  };

  /**
   * Cleanup Firebase listeners
   */
  const cleanupListeners = (code: string) => {
    const groupInfoRef = ref(database, `groups/${code}`);
    const membersRef = ref(database, `groups/${code}/members`);
    const meetingPointRef = ref(database, `groups/${code}/meetingPoint`);
    const alertsRef = ref(database, `groups/${code}/alerts`);
    const announcementsRef = ref(database, `groups/${code}/announcements`);

    off(groupInfoRef);
    off(membersRef);
    off(meetingPointRef);
    off(alertsRef);
    off(announcementsRef);

    console.log("Firebase listeners cleaned up for group:", code);
  };

  const changeLanguage = async (newLanguage: Language) => {
    try {
      await AsyncStorage.setItem("language", newLanguage);
      setLanguage(newLanguage);
    } catch (error) {
      console.error("Error changing language:", error);
    }
  };

  const saveUserName = async (name: string) => {
    try {
      await AsyncStorage.setItem("userName", name);
      setUserName(name);
    } catch (error) {
      console.error("Error saving user name:", error);
    }
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === "granted";
      setHasLocationPermission(granted);
      return granted;
    } catch (error) {
      console.error("Error requesting location permission:", error);
      return false;
    }
  };

  const requestNotificationPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      const granted = status === "granted";
      setHasNotificationPermission(granted);
      return granted;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  };

  /**
   * Create a new group in Firebase
   */
  const createGroup = async (): Promise<string> => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    if (!userName) {
      throw new Error("User name is required to create a group");
    }

    try {
      // Create group in Firebase
      const groupRef = ref(database, `groups/${code}`);
      await set(groupRef, {
        code: code,
        createdAt: Date.now(),
        createdBy: userName,
        members: {
          [userName]: {
            name: userName,
            latitude: currentLocation?.coords.latitude || 0,
            longitude: currentLocation?.coords.longitude || 0,
            lastUpdate: Date.now(),
          },
        },
      });

      // Save locally
      await AsyncStorage.setItem("groupCode", code);
      await AsyncStorage.setItem("isGroupLeader", "true");

      setGroupCode(code);
      setIsGroupLeader(true);
      setGroupLeaderName(userName);

      console.log("Group created successfully:", code);
      return code;
    } catch (error) {
      console.error("Error creating group:", error);
      throw error;
    }
  };

  /**
   * Validate if a group code exists in Firebase
   */
  const validateGroupCode = async (code: string): Promise<boolean> => {
    try {
      const groupRef = ref(database, `groups/${code}`);
      const snapshot = await get(groupRef);
      return snapshot.exists();
    } catch (error) {
      console.error("Error validating group code:", error);
      return false;
    }
  };

  /**
   * Join an existing group
   */
  const joinGroup = async (code: string) => {
    // Basic validation
    if (!code || code.length !== 6) {
      throw new Error("INVALID_CODE");
    }

    if (!userName) {
      throw new Error("User name is required to join a group");
    }

    // Check if group exists in Firebase
    const groupExists = await validateGroupCode(code);

    if (!groupExists) {
      throw new Error("GROUP_NOT_FOUND");
    }

    // Group exists, proceed with joining
    try {
      // Add member to Firebase
      const memberRef = ref(database, `groups/${code}/members/${userName}`);
      await set(memberRef, {
        name: userName,
        latitude: currentLocation?.coords.latitude || 0,
        longitude: currentLocation?.coords.longitude || 0,
        lastUpdate: Date.now(),
      });

      // Save locally
      await AsyncStorage.setItem("groupCode", code);
      await AsyncStorage.setItem("isGroupLeader", "false");

      setGroupCode(code);
      setIsGroupLeader(false);

      console.log("Joined group successfully:", code);
    } catch (error) {
      console.error("Error joining group:", error);
      throw new Error("STORAGE_ERROR");
    }
  };

  /**
   * Leave the current group
   */
  const leaveGroup = async () => {
    if (!groupCode || !userName) return;

    try {
      // Remove member from Firebase
      const memberRef = ref(
        database,
        `groups/${groupCode}/members/${userName}`,
      );
      await remove(memberRef);

      // Clean up listeners
      cleanupListeners(groupCode);

      // Clear local storage
      await AsyncStorage.removeItem("groupCode");
      await AsyncStorage.removeItem("isGroupLeader");

      setGroupCode(null);
      setIsGroupLeader(false);
      setGroupLeaderName(null);
      setGroupMembers([]);
      setMeetingPoint(null);
      setAnnouncements([]);

      console.log("Left group successfully");
    } catch (error) {
      console.error("Error leaving group:", error);
      throw error;
    }
  };

  /**
   * Logout - clear all user data
   */
  const logout = async () => {
    try {
      // Leave group first if in one
      if (groupCode && userName) {
        await leaveGroup();
      }

      // Clear local storage
      await AsyncStorage.multiRemove([
        "userName",
        "groupCode",
        "isGroupLeader",
      ]);

      setUserName(null);
      setGroupCode(null);
      setIsGroupLeader(false);
      setGroupLeaderName(null);
      setGroupMembers([]);
      setMeetingPoint(null);
      setAnnouncements([]);

      console.log("Logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
      throw error;
    }
  };

  /**
   * Set meeting point for the group
   */
  const setMeetingPointLocation = async (location: {
    latitude: number;
    longitude: number;
  }) => {
    if (!groupCode || !userName) return;

    try {
      const meetingPointRef = ref(database, `groups/${groupCode}/meetingPoint`);
      await set(meetingPointRef, {
        latitude: location.latitude,
        longitude: location.longitude,
        setBy: userName,
        setAt: Date.now(),
      });

      setMeetingPoint(location);

      // Send notification to group
      await sendNotificationToGroup(
        "Meeting Point Set",
        `${userName} has set a meeting point`,
      );

      console.log("Meeting point set successfully");
    } catch (error) {
      console.error("Error setting meeting point:", error);
    }
  };

  /**
   * Send panic alert to all group members
   */
  const sendPanicAlert = async () => {
    if (!userName || !groupCode || !currentLocation) return;

    try {
      const alertsRef = ref(database, `groups/${groupCode}/alerts`);
      const newAlertRef = push(alertsRef);

      await set(newAlertRef, {
        type: "panic",
        from: userName,
        title: "🚨 EMERGENCY ALERT",
        message: `${userName} needs help! Location: ${currentLocation.coords.latitude.toFixed(4)}, ${currentLocation.coords.longitude.toFixed(4)}`,
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        timestamp: Date.now(),
      });

      console.log("Panic alert sent successfully");
    } catch (error) {
      console.error("Error sending panic alert:", error);
    }
  };

  /**
   * Send notification to all group members
   */
  const sendNotificationToGroup = async (title: string, body: string) => {
    if (!groupCode) return;

    try {
      const alertsRef = ref(database, `groups/${groupCode}/alerts`);
      const newAlertRef = push(alertsRef);

      await set(newAlertRef, {
        type: "notification",
        from: userName,
        title: title,
        message: body,
        timestamp: Date.now(),
      });

      console.log("Notification sent to group:", title);
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  /**
   * Edit an existing announcement (only for group leaders)
   */
  const editAnnouncement = async (
    announcementId: string,
    newMessage: string,
    isPinned: boolean,
  ) => {
    if (!isGroupLeader) {
      throw new Error("Only group leaders can edit announcements");
    }

    if (!groupCode) {
      throw new Error("User must be in a group to edit announcements");
    }

    if (!newMessage.trim()) {
      throw new Error("Announcement message cannot be empty");
    }

    try {
      const announcementRef = ref(
        database,
        `groups/${groupCode}/announcements/${announcementId}`,
      );
      await update(announcementRef, {
        message: newMessage.trim(),
        isPinned: isPinned,
        editedAt: Date.now(),
      });

      console.log("Announcement edited successfully");
    } catch (error) {
      console.error("Error editing announcement:", error);
      throw error;
    }
  };

  /**
   * Delete an announcement (only for group leaders)
   */
  const deleteAnnouncement = async (announcementId: string) => {
    if (!isGroupLeader) {
      throw new Error("Only group leaders can delete announcements");
    }

    if (!groupCode) return;

    try {
      const announcementRef = ref(
        database,
        `groups/${groupCode}/announcements/${announcementId}`,
      );
      await remove(announcementRef);

      console.log("Announcement deleted successfully");
    } catch (error) {
      console.error("Error deleting announcement:", error);
      throw error;
    }
  };

  /**
   * Create a new announcement (only for group leaders)
   */
  const createAnnouncement = async (
    message: string,
    isPinned: boolean = false,
  ) => {
    if (!isGroupLeader) {
      throw new Error("Only group leaders can create announcements");
    }

    if (!userName || !groupCode) {
      throw new Error("User must be in a group to create announcements");
    }

    if (!message.trim()) {
      throw new Error("Announcement message cannot be empty");
    }

    try {
      const announcementsRef = ref(
        database,
        `groups/${groupCode}/announcements`,
      );
      const newAnnouncementRef = push(announcementsRef);

      await set(newAnnouncementRef, {
        leaderName: userName,
        message: message.trim(),
        isPinned: isPinned,
        timestamp: Date.now(),
        reactions: {},
      });

      console.log("Announcement created successfully");
    } catch (error) {
      console.error("Error creating announcement:", error);
      throw error;
    }
  };

  /**
   * Toggle pin status of an announcement (only for group leaders)
   */
  const toggleAnnouncementPin = async (announcementId: string) => {
    if (!isGroupLeader) {
      throw new Error("Only group leaders can pin/unpin announcements");
    }

    if (!groupCode) return;

    try {
      const announcement = announcements.find((a) => a.id === announcementId);
      if (!announcement) return;

      const announcementRef = ref(
        database,
        `groups/${groupCode}/announcements/${announcementId}`,
      );
      await update(announcementRef, {
        isPinned: !announcement.isPinned,
      });

      console.log("Announcement pin toggled");
    } catch (error) {
      console.error("Error toggling announcement pin:", error);
      throw error;
    }
  };

  /**
   * Add reaction to an announcement
   */
  const addReactionToAnnouncement = async (
    announcementId: string,
    emoji: string,
  ) => {
    if (!userName || !groupCode) return;

    try {
      const reactionRef = ref(
        database,
        `groups/${groupCode}/announcements/${announcementId}/reactions/${userName}`,
      );
      await set(reactionRef, emoji);

      console.log("Reaction added to announcement");
    } catch (error) {
      console.error("Error adding reaction:", error);
      throw error;
    }
  };

  /**
   * Remove reaction from an announcement
   */
  const removeReactionFromAnnouncement = async (announcementId: string) => {
    if (!userName || !groupCode) return;

    try {
      const reactionRef = ref(
        database,
        `groups/${groupCode}/announcements/${announcementId}/reactions/${userName}`,
      );
      await remove(reactionRef);

      console.log("Reaction removed from announcement");
    } catch (error) {
      console.error("Error removing reaction:", error);
      throw error;
    }
  };

  const simulateGroupMembers = () => {
    console.log("Group members are now synced in real-time from Firebase");
  };

  return {
    language,
    userName,
    groupCode,
    isGroupLeader,
    groupLeaderName,
    hasLocationPermission,
    hasNotificationPermission,
    currentLocation,
    groupMembers,
    meetingPoint,
    announcements,
    isLoading,
    changeLanguage,
    saveUserName,
    requestLocationPermission,
    requestNotificationPermission,
    createGroup,
    validateGroupCode,
    joinGroup,
    leaveGroup,
    logout,
    setMeetingPointLocation,
    sendPanicAlert,
    simulateGroupMembers,
    createAnnouncement,
    editAnnouncement,
    deleteAnnouncement,
    toggleAnnouncementPin,
    addReactionToAnnouncement,
    removeReactionFromAnnouncement,
  };
});
