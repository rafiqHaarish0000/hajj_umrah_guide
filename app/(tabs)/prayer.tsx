import { getTranslation } from "@/constants/translations";
import { useApp } from "@/context/AppContext";
import * as Notifications from "expo-notifications";
import { Bell, BellOff, Clock, Navigation } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

interface PrayerTime {
  name: string;
  time: string;
  key: string;
  alarmEnabled: boolean;
}

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function PrayerScreen() {
  const { language, currentLocation } = useApp();
  const [rotateAnim] = useState(new Animated.Value(0));
  const [qiblaDirection, setQiblaDirection] = useState<number>(0);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([
    { name: "Fajr", time: "05:30 AM", key: "fajr", alarmEnabled: false },
    { name: "Dhuhr", time: "12:45 PM", key: "dhuhr", alarmEnabled: false },
    { name: "Asr", time: "04:15 PM", key: "asr", alarmEnabled: false },
    { name: "Maghrib", time: "07:00 PM", key: "maghrib", alarmEnabled: false },
    { name: "Isha", time: "08:30 PM", key: "isha", alarmEnabled: false },
  ]);

  const t = (
    key: keyof typeof import("@/constants/translations").translations.en,
  ) => getTranslation(language, key);

  useEffect(() => {
    requestNotificationPermissions();
    if (Platform.OS === "android") {
      setupAndroidNotificationChannel();
    }
    if (currentLocation) {
      calculateQiblaDirection();
    }
  }, [currentLocation]);

  const setupAndroidNotificationChannel = async () => {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("prayer-alarms", {
        name: "Prayer Alarms",
        importance: Notifications.AndroidImportance.HIGH,
        sound: "default",
        vibrationPattern: [0, 250, 250, 250],
      });
    }
  };

  const requestNotificationPermissions = async () => {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please enable notifications to receive prayer time alerts",
      );
      return false;
    }
    return true;
  };

  const calculateQiblaDirection = () => {
    if (!currentLocation) return;

    const kaabaLat = 21.4225;
    const kaabaLng = 39.8262;
    const userLat = currentLocation.coords.latitude;
    const userLng = currentLocation.coords.longitude;

    const dLng = (kaabaLng - userLng) * (Math.PI / 180);
    const lat1 = userLat * (Math.PI / 180);
    const lat2 = kaabaLat * (Math.PI / 180);

    const y = Math.sin(dLng) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

    let bearing = Math.atan2(y, x) * (180 / Math.PI);
    bearing = (bearing + 360) % 360;

    setQiblaDirection(bearing);
  };

  const parseTimeToDate = (timeString: string): Date => {
    const [time, period] = timeString.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (period === "PM" && hours !== 12) {
      hours += 12;
    } else if (period === "AM" && hours === 12) {
      hours = 0;
    }

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    // If the time has passed today, schedule for tomorrow
    if (date < new Date()) {
      date.setDate(date.getDate() + 1);
    }

    return date;
  };

  const scheduleNotification = async (prayer: PrayerTime) => {
    const triggerDate = parseTimeToDate(prayer.time);
    const now = new Date();
    const secondsUntilTrigger = Math.floor(
      (triggerDate.getTime() - now.getTime()) / 1000,
    );

    const trigger: Notifications.NotificationTriggerInput = Platform.select({
      ios: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: triggerDate.getHours(),
        minute: triggerDate.getMinutes(),
        repeats: true,
      },
      android: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: triggerDate.getHours(),
        minute: triggerDate.getMinutes(),
        repeats: true,
        channelId: "prayer-alarms",
      },
      default: {
        seconds: secondsUntilTrigger > 0 ? secondsUntilTrigger : 60,
        repeats: true,
      },
    }) as Notifications.NotificationTriggerInput;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${prayer.name} Prayer Time`,
        body: `It's time for ${prayer.name} prayer`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger,
      identifier: `prayer-${prayer.key}`,
    });
  };

  const cancelNotification = async (prayerKey: string) => {
    const allNotifications =
      await Notifications.getAllScheduledNotificationsAsync();
    const notification = allNotifications.find(
      (n) => n.identifier === `prayer-${prayerKey}`,
    );

    if (notification) {
      await Notifications.cancelScheduledNotificationAsync(
        notification.identifier,
      );
    }
  };

  const toggleAlarm = async (prayerKey: string) => {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return;

    setPrayerTimes((prev) =>
      prev.map((prayer) => {
        if (prayer.key === prayerKey) {
          const newAlarmState = !prayer.alarmEnabled;

          if (newAlarmState) {
            scheduleNotification(prayer);
            Alert.alert(
              "Alarm Set",
              `You will be notified at ${prayer.time} for ${prayer.name} prayer`,
            );
          } else {
            cancelNotification(prayerKey);
            Alert.alert(
              "Alarm Cancelled",
              `${prayer.name} prayer alarm has been turned off`,
            );
          }

          return { ...prayer, alarmEnabled: newAlarmState };
        }
        return prayer;
      }),
    );
  };

  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  let nextPrayerIndex = 0;

  if (currentHour >= 20) nextPrayerIndex = 0;
  else if (currentHour >= 19) nextPrayerIndex = 4;
  else if (currentHour >= 16) nextPrayerIndex = 3;
  else if (currentHour >= 12) nextPrayerIndex = 2;
  else if (currentHour >= 5) nextPrayerIndex = 1;

  return (
    <View style={styles.container}>
      <View style={styles.backgroundTop} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Clock size={40} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.headerTitle}>{t("prayerTimes")}</Text>
          </View>

          <View style={styles.nextPrayerCard}>
            <Text style={styles.nextPrayerLabel}>{t("nextPrayer")}</Text>
            <Text style={styles.nextPrayerName}>
              {prayerTimes[nextPrayerIndex].name}
            </Text>
            <Text style={styles.nextPrayerTime}>
              {prayerTimes[nextPrayerIndex].time}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Prayer Times</Text>
            <View style={styles.prayerList}>
              {prayerTimes.map((prayer, index) => (
                <View
                  key={prayer.key}
                  style={[
                    styles.prayerItem,
                    index === nextPrayerIndex && styles.prayerItemActive,
                  ]}
                >
                  <View style={styles.prayerInfo}>
                    {prayer.alarmEnabled ? (
                      <Bell size={20} color="#0D7C66" strokeWidth={2.5} />
                    ) : (
                      <BellOff size={20} color="#CCCCCC" strokeWidth={2.5} />
                    )}
                    <View style={styles.prayerTextContainer}>
                      <Text
                        style={[
                          styles.prayerName,
                          index === nextPrayerIndex && styles.prayerNameActive,
                        ]}
                      >
                        {prayer.name}
                      </Text>
                      <Text
                        style={[
                          styles.prayerTime,
                          index === nextPrayerIndex && styles.prayerTimeActive,
                        ]}
                      >
                        {prayer.time}
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={prayer.alarmEnabled}
                    onValueChange={() => toggleAlarm(prayer.key)}
                    trackColor={{ false: "#E0E0E0", true: "#A8E6CF" }}
                    thumbColor={prayer.alarmEnabled ? "#0D7C66" : "#f4f3f4"}
                    ios_backgroundColor="#E0E0E0"
                  />
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("qibla")}</Text>
            <View style={styles.qiblaCard}>
              <View style={styles.compassContainer}>
                <View style={styles.compassCircle}>
                  <Navigation
                    size={64}
                    color="#0D7C66"
                    strokeWidth={3}
                    style={{ transform: [{ rotate: `${qiblaDirection}deg` }] }}
                  />
                </View>
                <Text style={styles.compassText}>
                  {Math.round(qiblaDirection)}°
                </Text>
              </View>
              <Text style={styles.qiblaInfo}>
                Point your device in this direction to face the Kaaba
              </Text>
            </View>
          </View>
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
    height: 250,
    backgroundColor: "#0D7C66",
  },
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 100,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    marginTop: 12,
  },
  nextPrayerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  nextPrayerLabel: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: "#666666",
    marginBottom: 8,
  },
  nextPrayerName: {
    fontSize: 32,
    fontWeight: "800" as const,
    color: "#0D7C66",
    marginBottom: 4,
  },
  nextPrayerTime: {
    fontSize: 24,
    fontWeight: "600" as const,
    color: "#1A1A1A",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginBottom: 16,
  },
  prayerList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  prayerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  prayerItemActive: {
    backgroundColor: "#E6F7F4",
  },
  prayerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  prayerTextContainer: {
    flex: 1,
  },
  prayerName: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1A1A1A",
    marginBottom: 2,
  },
  prayerNameActive: {
    color: "#0D7C66",
    fontWeight: "700" as const,
  },
  prayerTime: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: "#666666",
  },
  prayerTimeActive: {
    color: "#0D7C66",
    fontWeight: "600" as const,
  },
  qiblaCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  compassContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  compassCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#E6F7F4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 4,
    borderColor: "#0D7C66",
  },
  compassText: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#0D7C66",
  },
  qiblaInfo: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: "#666666",
    textAlign: "center",
    lineHeight: 22,
  },
});
