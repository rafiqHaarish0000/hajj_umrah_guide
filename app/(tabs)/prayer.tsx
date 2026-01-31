import { getTranslation } from "@/constants/translations";
import { useApp } from "@/context/AppContext";
import Constants from "expo-constants";
import { Magnetometer } from "expo-sensors";
import { Bell, BellOff, Clock, Crown, Navigation } from "lucide-react-native";
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
  TouchableOpacity,
  View,
} from "react-native";

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === "expo";

// Lazy load notifications only if NOT in Expo Go
let Notifications: any = null;
let notificationsAvailable = false;

interface PrayerTime {
  name: string;
  time: string;
  key: string;
  alarmEnabled: boolean;
}

// Initialize notifications safely - only if not in Expo Go
const initNotifications = async () => {
  if (isExpoGo) {
    console.log("Running in Expo Go - notifications disabled");
    notificationsAvailable = false;
    return null;
  }

  if (!Notifications && !notificationsAvailable) {
    try {
      Notifications = await import("expo-notifications");
      notificationsAvailable = true;

      // Configure notification handler after loading
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });

      console.log("Notifications module loaded successfully");
    } catch (error) {
      console.warn("Notifications not available:", error);
      notificationsAvailable = false;
    }
  }
  return Notifications;
};

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

  const [heading, setHeading] = useState(0);

  const getHeadingFromMagnetometer = (data: {
    x: number;
    y: number;
    z: number;
  }) => {
    let angle = Math.atan2(data.y, data.x);
    let degree = (angle * 180) / Math.PI;
    return (degree + 360) % 360;
  };

  useEffect(() => {
    Magnetometer.setUpdateInterval(100);

    const sub = Magnetometer.addListener((data) => {
      const newHeading = getHeadingFromMagnetometer(data);
      setHeading(newHeading);
    });

    return () => sub.remove();
  }, []);

  const arrowRotation = (qiblaDirection - heading + 360) % 360;

  const t = (
    key: keyof typeof import("@/constants/translations").translations.en,
  ) => getTranslation(language ?? "en", key);

  useEffect(() => {
    if (!isExpoGo) {
      initializeNotifications();
    }
    if (currentLocation) {
      calculateQiblaDirection();
    }
  }, [currentLocation]);

  const initializeNotifications = async () => {
    await initNotifications();
    await requestNotificationPermissions();
    if (Platform.OS === "android") {
      await setupAndroidNotificationChannel();
    }
  };

  const setupAndroidNotificationChannel = async () => {
    if (Platform.OS === "android" && notificationsAvailable) {
      try {
        const NotificationsModule = await initNotifications();
        if (NotificationsModule) {
          await NotificationsModule.setNotificationChannelAsync(
            "prayer-alarms",
            {
              name: "Prayer Alarms",
              importance: NotificationsModule.AndroidImportance.HIGH,
              sound: "default",
              vibrationPattern: [0, 250, 250, 250],
            },
          );
        }
      } catch (error) {
        console.log("Could not setup notification channel:", error);
      }
    }
  };

  const requestNotificationPermissions = async () => {
    if (!notificationsAvailable) {
      return false;
    }

    try {
      const NotificationsModule = await initNotifications();
      if (!NotificationsModule) return false;

      const { status: existingStatus } =
        await NotificationsModule.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await NotificationsModule.requestPermissionsAsync();
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
    } catch (error) {
      console.log("Could not request notification permissions:", error);
      return false;
    }
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
    if (!notificationsAvailable) {
      console.log("Notifications not available - alarm not set");
      return;
    }

    try {
      const NotificationsModule = await initNotifications();
      if (!NotificationsModule) return;

      const triggerDate = parseTimeToDate(prayer.time);
      const now = new Date();
      const secondsUntilTrigger = Math.floor(
        (triggerDate.getTime() - now.getTime()) / 1000,
      );

      const trigger: any = Platform.select({
        ios: {
          type: NotificationsModule.SchedulableTriggerInputTypes.DAILY,
          hour: triggerDate.getHours(),
          minute: triggerDate.getMinutes(),
          repeats: true,
        },
        android: {
          type: NotificationsModule.SchedulableTriggerInputTypes.DAILY,
          hour: triggerDate.getHours(),
          minute: triggerDate.getMinutes(),
          repeats: true,
          channelId: "prayer-alarms",
        },
        default: {
          seconds: secondsUntilTrigger > 0 ? secondsUntilTrigger : 60,
          repeats: true,
        },
      });

      await NotificationsModule.scheduleNotificationAsync({
        content: {
          title: `${prayer.name} Prayer Time`,
          body: `It's time for ${prayer.name} prayer`,
          sound: true,
          priority: NotificationsModule.AndroidNotificationPriority.HIGH,
        },
        trigger,
        identifier: `prayer-${prayer.key}`,
      });
    } catch (error) {
      console.log("Could not schedule notification:", error);
    }
  };

  const cancelNotification = async (prayerKey: string) => {
    if (!notificationsAvailable) return;

    try {
      const NotificationsModule = await initNotifications();
      if (!NotificationsModule) return;

      const allNotifications =
        await NotificationsModule.getAllScheduledNotificationsAsync();
      const notification = allNotifications.find(
        (n: any) => n.identifier === `prayer-${prayerKey}`,
      );

      if (notification) {
        await NotificationsModule.cancelScheduledNotificationAsync(
          notification.identifier,
        );
      }
    } catch (error) {
      console.log("Could not cancel notification:", error);
    }
  };

  const toggleAlarm = async (prayerKey: string) => {
    if (isExpoGo) {
      Alert.alert(
        "Feature Not Available",
        "Prayer alarms will only in premium version",
        [{ text: "OK" }],
      );
      return;
    }

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

  const calculateDistanceToKaaba = (location: any): number => {
    const kaabaLat = 21.4225;
    const kaabaLng = 39.8262;
    const userLat = location.coords.latitude;
    const userLng = location.coords.longitude;

    const R = 6371; // Earth's radius in km
    const dLat = ((kaabaLat - userLat) * Math.PI) / 180;
    const dLng = ((kaabaLng - userLng) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((userLat * Math.PI) / 180) *
        Math.cos((kaabaLat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

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
            <View style={styles.premiumNoticeCard}>
              <View style={styles.premiumNoticeContent}>
                <View style={styles.premiumNoticeIcon}>
                  <Crown size={24} color="#F59E0B" strokeWidth={2.5} />
                </View>
                <View style={styles.premiumNoticeText}>
                  <Text style={styles.premiumNoticeTitle}>Premium Feature</Text>
                  <Text style={styles.premiumNoticeSubtitle}>
                    Prayer alarms are available in Premium
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={() => {
                  // Add your upgrade navigation here
                  // router.push('/subscription') or setShowSubscriptionModal(true)
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.upgradeButtonText}>Upgrade</Text>
              </TouchableOpacity>
            </View>
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
                    disabled={isExpoGo}
                  />
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("qibla")}</Text>
            <View style={styles.qiblaCard}>
              {/* Kaaba Image/Icon Header */}
              <View style={styles.kaabaHeader}>
                <View style={styles.kaabaIconContainer}>
                  <Text style={styles.kaabaIcon}>🕋</Text>
                </View>
                <Text style={styles.kaabaText}>Direction to Kaaba</Text>
                <Text style={styles.kaabaSubtext}>Makkah, Saudi Arabia</Text>
              </View>

              {/* Animated Compass */}
              <View style={styles.compassContainer}>
                {/* Outer Ring with Marks */}
                <View style={styles.compassOuterRing}>
                  {/* Cardinal Direction Labels */}
                  <Text style={[styles.cardinalLabel, styles.cardinalN]}>
                    N
                  </Text>
                  <Text style={[styles.cardinalLabel, styles.cardinalE]}>
                    E
                  </Text>
                  <Text style={[styles.cardinalLabel, styles.cardinalS]}>
                    S
                  </Text>
                  <Text style={[styles.cardinalLabel, styles.cardinalW]}>
                    W
                  </Text>

                  {/* Degree Marks */}
                  {[...Array(36)].map((_, i) => {
                    const angle = i * 10;
                    const isCardinal = angle % 90 === 0;
                    return (
                      <View
                        key={i}
                        style={[
                          styles.degreeMark,
                          isCardinal && styles.degreeMarkCardinal,
                          {
                            transform: [
                              { rotate: `${angle}deg` },
                              { translateY: -85 },
                            ],
                          },
                        ]}
                      />
                    );
                  })}
                </View>

                {/* Middle Ring */}
                <View style={styles.compassMiddleRing} />

                {/* Inner Circle with Navigation Arrow */}
                <View style={styles.compassInnerCircle}>
                  <View
                    style={{
                      transform: [{ rotate: `${arrowRotation}deg` }],
                    }}
                  >
                    <Navigation size={80} color="#0D7C66" strokeWidth={3} />
                    <View style={styles.arrowGlow} />
                  </View>
                </View>

                {/* Center Dot */}
                <View style={styles.centerDot} />
              </View>

              {/* Direction Info */}
              <View style={styles.directionInfoContainer}>
                <View style={styles.directionBox}>
                  <Text style={styles.directionLabel}>Heading</Text>
                  <Text style={styles.directionValue}>
                    {Math.round(qiblaDirection)}°
                  </Text>
                </View>
                <View style={styles.directionDivider} />
                <View style={styles.directionBox}>
                  <Text style={styles.directionLabel}>Distance</Text>
                  <Text style={styles.directionValue}>
                    {currentLocation
                      ? `${Math.round(calculateDistanceToKaaba(currentLocation))} km`
                      : "---"}
                  </Text>
                </View>
              </View>

              {/* Instructions */}
              <View style={styles.instructionsContainer}>
                <View style={styles.instructionStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>1</Text>
                  </View>
                  <Text style={styles.stepText}>
                    Hold phone flat in your hand
                  </Text>
                </View>
                <View style={styles.instructionStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>2</Text>
                  </View>
                  <Text style={styles.stepText}>
                    Rotate until arrow points up
                  </Text>
                </View>
                <View style={styles.instructionStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>3</Text>
                  </View>
                  <Text style={styles.stepText}>Face the Kaaba direction</Text>
                </View>
              </View>

              {/* Accuracy Note */}
              <View style={styles.accuracyNote}>
                <Text style={styles.accuracyText}>
                  📍 Calibrate your phone's compass for best accuracy
                </Text>
              </View>
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
  expoGoNotice: {
    backgroundColor: "#FFF3CD",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#FFC107",
  },
  expoGoNoticeText: {
    fontSize: 13,
    color: "#856404",
    lineHeight: 18,
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
  qiblaCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  kaabaHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  kaabaIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#E6F7F4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "#0D7C66",
    shadowColor: "#0D7C66",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  kaabaIcon: {
    fontSize: 36,
  },
  kaabaText: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#0D7C66",
    marginBottom: 4,
  },
  kaabaSubtext: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#999999",
  },
  compassContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    height: 240,
    position: "relative",
  },
  compassOuterRing: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    backgroundColor: "#FAFAFA",
  },
  cardinalLabel: {
    position: "absolute",
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#0D7C66",
  },
  cardinalN: { top: 5, left: "50%", marginLeft: -8 },
  cardinalE: { right: 5, top: "50%", marginTop: -10 },
  cardinalS: { bottom: 5, left: "50%", marginLeft: -8 },
  cardinalW: { left: 5, top: "50%", marginTop: -10 },
  degreeMark: {
    position: "absolute",
    width: 2,
    height: 8,
    backgroundColor: "#CCCCCC",
    left: "50%",
    top: "50%",
    marginLeft: -1,
  },
  degreeMarkCardinal: {
    height: 12,
    width: 3,
    backgroundColor: "#0D7C66",
  },
  compassMiddleRing: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    borderColor: "#0D7C66",
    borderStyle: "dashed",
  },
  compassInnerCircle: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#E6F7F4",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0D7C66",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  arrowGlow: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#0D7C66",
    opacity: 0.2,
    top: -10,
    left: 10,
  },
  centerDot: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#0D7C66",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  directionInfoContainer: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  directionBox: {
    flex: 1,
    alignItems: "center",
  },
  directionLabel: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#999999",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  directionValue: {
    fontSize: 24,
    fontWeight: "800" as const,
    color: "#0D7C66",
  },
  directionDivider: {
    width: 1,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 16,
  },
  instructionsContainer: {
    backgroundColor: "#E6F7F4",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  instructionStep: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#0D7C66",
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  stepText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#0D7C66",
    flex: 1,
  },
  accuracyNote: {
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
  },
  accuracyText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#92400E",
    lineHeight: 18,
  },
  premiumNoticeCard: {
    backgroundColor: "#FEF3C7",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#F59E0B",
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  premiumNoticeContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  premiumNoticeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  premiumNoticeText: {
    flex: 1,
  },
  premiumNoticeTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#92400E",
    marginBottom: 2,
  },
  premiumNoticeSubtitle: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#B45309",
    lineHeight: 18,
  },
  upgradeButton: {
    backgroundColor: "#F59E0B",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
});
