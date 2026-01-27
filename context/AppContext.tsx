import { Language } from "@/constants/translations";
import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";

export interface GroupMember {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  lastUpdate: number;
  color: string;
}

export interface AppState {
  language: Language;
  userName: string | null;
  groupCode: string | null;
  isGroupLeader: boolean;
  hasLocationPermission: boolean;
  hasNotificationPermission: boolean;
  currentLocation: Location.LocationObject | null;
  groupMembers: GroupMember[];
  meetingPoint: { latitude: number; longitude: number } | null;
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
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadStoredData();
  }, []);

  useEffect(() => {
    if (hasLocationPermission) {
      startLocationTracking();
    }
  }, [hasLocationPermission]);

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

      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 120000,
          distanceInterval: 50,
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

  const updateUserLocationInGroup = (location: Location.LocationObject) => {
    if (!userName || !groupCode) return;

    const userMember: GroupMember = {
      id: userName,
      name: userName,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      lastUpdate: Date.now(),
      color: COLORS[0],
    };

    setGroupMembers((prev) => {
      const existing = prev.find((m) => m.id === userName);
      if (existing) {
        return prev.map((m) => (m.id === userName ? userMember : m));
      }
      return [...prev, userMember];
    });
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

  const createGroup = async (): Promise<string> => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    try {
      await AsyncStorage.setItem("groupCode", code);
      await AsyncStorage.setItem("isGroupLeader", "true");

      // Store the group code in the valid groups list
      const existingGroups = await AsyncStorage.getItem("validGroupCodes");
      const groupsArray = existingGroups ? JSON.parse(existingGroups) : [];
      groupsArray.push(code);
      await AsyncStorage.setItem(
        "validGroupCodes",
        JSON.stringify(groupsArray),
      );

      setGroupCode(code);
      setIsGroupLeader(true);
      return code;
    } catch (error) {
      console.error("Error creating group:", error);
      throw error;
    }
  };

  /**
   * Validates if a group code exists in the database
   * @param code - The 6-digit group code to validate
   * @returns Promise<boolean> - true if group exists, false otherwise
   */
  const validateGroupCode = async (code: string): Promise<boolean> => {
    try {
      // Get all valid group codes from AsyncStorage
      const existingGroups = await AsyncStorage.getItem("validGroupCodes");

      if (!existingGroups) {
        return false;
      }

      const groupsArray: string[] = JSON.parse(existingGroups);
      return groupsArray.includes(code);
    } catch (error) {
      console.error("Error validating group code:", error);
      return false;
    }
  };

  const joinGroup = async (code: string) => {
    // Basic validation
    if (!code || code.length !== 6) {
      throw new Error("INVALID_CODE");
    }

    // Check if group exists in database
    const groupExists = await validateGroupCode(code);

    if (!groupExists) {
      throw new Error("GROUP_NOT_FOUND");
    }

    // Group exists, proceed with joining
    try {
      await AsyncStorage.setItem("groupCode", code);
      await AsyncStorage.setItem("isGroupLeader", "false");
      setGroupCode(code);
      setIsGroupLeader(false);
    } catch (error) {
      console.error("Error saving group data:", error);
      throw new Error("STORAGE_ERROR");
    }
  };

  const leaveGroup = async () => {
    try {
      await AsyncStorage.removeItem("groupCode");
      await AsyncStorage.removeItem("isGroupLeader");
      setGroupCode(null);
      setIsGroupLeader(false);
      setGroupMembers([]);
      setMeetingPoint(null);
    } catch (error) {
      console.error("Error leaving group:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove([
        "userName",
        "groupCode",
        "isGroupLeader",
      ]);
      setUserName(null);
      setGroupCode(null);
      setIsGroupLeader(false);
      setGroupMembers([]);
      setMeetingPoint(null);
    } catch (error) {
      console.error("Error logging out:", error);
      throw error;
    }
  };

  const setMeetingPointLocation = (location: {
    latitude: number;
    longitude: number;
  }) => {
    setMeetingPoint(location);
    if (userName && groupCode) {
      sendNotificationToGroup(
        "Meeting point set",
        `${userName} has set a meeting point`,
      );
    }
  };

  const sendPanicAlert = async () => {
    if (!userName || !groupCode || !currentLocation) return;

    await sendNotificationToGroup(
      "EMERGENCY ALERT",
      `${userName} needs help! Location: ${currentLocation.coords.latitude.toFixed(4)}, ${currentLocation.coords.longitude.toFixed(4)}`,
    );
  };

  const sendNotificationToGroup = async (title: string, body: string) => {
    console.log("Notification sent to group:", title, body);
  };

  const simulateGroupMembers = () => {
    console.log("Group members will be synced from server");
  };

  return {
    language,
    userName,
    groupCode,
    isGroupLeader,
    hasLocationPermission,
    hasNotificationPermission,
    currentLocation,
    groupMembers,
    meetingPoint,
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
  };
});
