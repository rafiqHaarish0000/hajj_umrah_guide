import { getTranslation } from "@/constants/translations";
import { useApp } from "@/context/AppContext";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import {
  Bell,
  BookMarked,
  BookOpen,
  Calendar,
  Clock,
  Compass,
  Crown,
  Heart,
  Map,
  MapPin,
  Phone,
  Users,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

export default function HomeScreen() {
  const router = useRouter();
  const [userLocation, setUserLocation] = useState({
    latitude: 21.4225,
    longitude: 39.8262,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  useEffect(() => {
    let locationSubscription: any;

    const startLocationTracking = async () => {
      try {
        // Request location permission
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.log("Permission to access location was denied");
          return;
        }

        // Get initial location
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });

        // Watch location changes in real-time
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 1000,
            distanceInterval: 10,
          },
          (location) => {
            setUserLocation({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            });
          },
        );
      } catch (error) {
        console.log("Error getting location:", error);
      }
    };

    startLocationTracking();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  const { language, userName, groupCode } = useApp();

  const t = (
    key: keyof typeof import("@/constants/translations").translations.en,
  ) => getTranslation(language ?? "en", key);

  const handleProfilePress = () => {
    router.push("./profile");
  };

  const getInitials = (name: string | null): string => {
    if (!name) return "U";
    const words = name.trim().split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const menuItems = [
    {
      id: "map",
      title: t("liveMap"),
      icon: Map,
      color: "#FF6B6B",
      route: "/map",
    },
    {
      id: "announcements",
      title: t("announcements"),
      icon: Bell,
      color: "#4ECDC4",
      route: "/announcements",
    },
    {
      id: "facilities",
      title: t("nearbyPlaces"),
      icon: MapPin,
      color: "#45B7D1",
      route: "/facilities",
    },
    {
      id: "prayer",
      title: t("prayerQibla"),
      icon: Clock,
      color: "#FFA07A",
      route: "/prayer",
    },
    {
      id: "duas",
      title: t("duas"),
      icon: BookOpen,
      color: "#98D8C8",
      route: "/duas",
    },
    {
      id: "dailyplan",
      title: t("checklist"),
      icon: Calendar,
      color: "#96a088",
      route: "/daily-plan",
    },
    {
      id: "ritualguide",
      title: t("mistakePrevension"),
      icon: BookMarked,
      color: "#95e28b",
      route: "/ritual-guide",
    },
    {
      id: "emergency",
      title: t("emergency"),
      icon: Phone,
      color: "#b87373",
      route: "/panic",
    },
  ];

  const facilityImages = [
    { id: "1", title: "Haram Gate", color: "#FF6B6B" },
    { id: "2", title: "Bus Stops", color: "#4ECDC4" },
    { id: "3", title: "Hotels", color: "#FFD700" },
    { id: "4", title: "Hospitals", color: "#98D8C8" },
  ];

  const announcements = [
    {
      id: "1",
      sender: "Group Leader",
      message: "Fajr prayer at 5:15 AM",
      time: "8:45 AM",
      isLeader: true,
    },
    {
      id: "2",
      sender: "You",
      message: "Thank you for the reminder",
      time: "8:46 AM",
      isLeader: false,
    },
    {
      id: "3",
      sender: "Group Leader",
      message: "Your group is proceeding to Arafat",
      time: "9:30 AM",
      isLeader: true,
    },
    {
      id: "4",
      sender: "Group Leader",
      message: "High temperature - drink water",
      time: "10:15 AM",
      isLeader: true,
    },
  ];

  const duas = [
    {
      id: "1",
      title: "Labbaik",
      arabic: "لبيك اللهم لبيك",
      translation: "Here I am, O Allah, at Your service",
    },
    {
      id: "2",
      title: "Talbiah",
      arabic: "لا إله إلا الله",
      translation: "There is no deity except Allah",
    },
    {
      id: "3",
      title: "Dua Arafah",
      arabic: "اللهم إني أسألك",
      translation: "O Allah, I ask You",
    },
    {
      id: "4",
      title: "Dua Tawaf",
      arabic: "اللهم اغفر لي",
      translation: "O Allah, forgive me",
    },
  ];

  const prayerTimes = [
    { name: "Fajr", time: "05:15", icon: Clock },
    { name: "Dhuhr", time: "12:45", icon: Clock },
    { name: "Asr", time: "16:30", icon: Clock },
    { name: "Maghrib", time: "19:00", icon: Clock },
    { name: "Isha", time: "20:30", icon: Clock },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.backgroundTop} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>As-salamu alaykum</Text>
            <Text style={styles.userName}>{userName || "Pilgrim"}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={handleProfilePress}
            activeOpacity={0.8}
          >
            <Text style={styles.profileInitials}>{getInitials(userName)}</Text>
          </TouchableOpacity>
        </View>

        {groupCode && (
          <View style={styles.groupCard}>
            <Users size={24} color="#0D7C66" strokeWidth={2.5} />
            <View style={styles.groupInfo}>
              <Text style={styles.groupLabel}>Group Code</Text>
              <Text style={styles.groupCode}>{groupCode}</Text>
            </View>
          </View>
        )}

        <View style={styles.premiumNoticeCard}>
          <View style={styles.premiumNoticeContent}>
            <View style={styles.premiumNoticeIcon}>
              <Crown size={28} color="#0D7C66" strokeWidth={2.5} />
            </View>
            <View style={styles.premiumNoticeText}>
              <Text style={styles.premiumNoticeTitle}>Nusk Plus Premium</Text>
              <Text style={styles.premiumNoticeSubtitle}>
                Real-time alerts, prayer reminders & exclusive guidance and more
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
            <Text style={styles.upgradeButtonText}>Unlock Premium</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Horizontal Menu Items */}
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Quick Access</Text>
          </View>

          {/* Live Map Card */}
          <View style={styles.mapSection}>
            <MapView
              style={styles.mapContainer}
              region={userLocation}
              scrollEnabled={false}
              zoomEnabled={false}
              rotateEnabled={false}
              pitchEnabled={false}
            >
              <Marker
                coordinate={{
                  latitude: userLocation.latitude,
                  longitude: userLocation.longitude,
                }}
                title="Your Current Location"
                description="Real-time tracking"
              />
            </MapView>
            <View style={styles.mapCardInfo}>
              <Text style={styles.mapCardTitle}>Live Map Tracking</Text>
              <Text style={styles.mapCardDescription}>
                Real-time tracking of your group location and nearby pilgrims
              </Text>
              <TouchableOpacity
                style={styles.mapActionButton}
                onPress={() => router.push("/map" as any)}
              >
                <Text style={styles.mapActionButtonText}>View Full Map</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Announcements Chat UI */}
          <View style={styles.announcementSection}>
            <View style={styles.announcementHeader}>
              <Bell size={24} color="#0D7C66" strokeWidth={2.5} />
              <Text style={styles.announcementTitle}>Group Chat</Text>
            </View>
            <View style={styles.chatContainer}>
              {announcements.map((ann, index) => (
                <View
                  key={ann.id}
                  style={[
                    styles.chatMessage,
                    {
                      alignItems: ann.isLeader ? "flex-start" : "flex-end",
                      marginBottom: index === announcements.length - 1 ? 0 : 10,
                    },
                  ]}
                >
                  {ann.isLeader && (
                    <View style={styles.senderAvatar}>
                      <Text style={styles.senderAvatarText}>GL</Text>
                    </View>
                  )}
                  <View
                    style={[
                      styles.messageBubble,
                      {
                        backgroundColor: ann.isLeader ? "#F0F8F6" : "#0D7C66",
                        marginLeft: ann.isLeader ? 8 : 0,
                        marginRight: ann.isLeader ? 0 : 8,
                      },
                    ]}
                  >
                    {ann.isLeader && (
                      <Text style={styles.senderName}>Group Leader</Text>
                    )}
                    <Text
                      style={[
                        styles.messageText,
                        { color: ann.isLeader ? "#1A1A1A" : "#FFFFFF" },
                      ]}
                    >
                      {ann.message}
                    </Text>
                    <Text
                      style={[
                        styles.messageTime,
                        {
                          color: ann.isLeader
                            ? "#888888"
                            : "rgba(255,255,255,0.7)",
                        },
                      ]}
                    >
                      {ann.time}
                    </Text>
                  </View>
                  {!ann.isLeader && (
                    <View style={styles.userAvatar}>
                      <Text style={styles.userAvatarText}>
                        {getInitials(userName)}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => router.push("/announcements" as any)}
            >
              <Text style={styles.viewAllButtonText}>View Full Chat</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Facilities Horizontal Scroll */}
          <View style={styles.facilitiesSection}>
            <Text style={styles.sectionTitle}>Essential Facilities</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {facilityImages.map((facility) => (
                <View key={facility.id} style={styles.facilityCard}>
                  <View
                    style={[
                      styles.facilityImageContainer,
                      { backgroundColor: facility.color },
                    ]}
                  >
                    <MapPin size={40} color="#FFFFFF" strokeWidth={2} />
                  </View>
                  <Text style={styles.facilityCardTitle}>{facility.title}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Nearby Places Card */}
          <View style={styles.nearbyPlacesCard}>
            <View style={styles.nearbyHeader}>
              <MapPin size={24} color="#0D7C66" strokeWidth={2.5} />
              <Text style={styles.nearbyTitle}>Nearby Places</Text>
            </View>
            <Text style={styles.nearbyDescription}>
              Find restaurants, restrooms, and other essential services nearby
            </Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => router.push("/facilities" as any)}
            >
              <Text style={styles.exploreButtonText}>Explore Nearby</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Prayer Times Section */}
          <View style={styles.prayerSection}>
            <View style={styles.prayerClockContainer}>
              <Clock size={60} color="#0D7C66" strokeWidth={2} />
            </View>

            <View style={styles.prayerInfoCard}>
              <Text style={styles.prayerCardTitle}>Qibla & Prayer Times</Text>
              <Text style={styles.prayerCardDescription}>
                Stay connected with daily prayers and Qibla direction
              </Text>

              <TouchableOpacity
                style={styles.prayerActionButton}
                onPress={() => router.push("/prayer" as any)}
              >
                <Compass size={18} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.prayerActionButtonText}>
                  Qibla & Prayer Times
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Duas Section */}
          <View style={styles.duasMainSection}>
            <View style={styles.duasHeader}>
              <BookOpen size={24} color="#0D7C66" strokeWidth={2.5} />
              <Text style={styles.duasHeaderTitle}>Sacred Duas</Text>
            </View>

            {/* Quran Verse */}
            <View style={styles.quranVerseCard}>
              <Text style={styles.quranVerseArabic}>
                "رَبَّنَا تَقَبَّلْ مِنَّا"
              </Text>
              <Text style={styles.quranVerseTranslation}>
                "Our Lord, accept [this] from us"
              </Text>
              <Text style={styles.quranVerseReference}>
                - Surah Al-Baqarah (2:127)
              </Text>
            </View>

            {/* Duas Horizontal Scroll */}
            <View style={styles.duasSubtitleContainer}>
              <Text style={styles.duasSubtitle}>Common Duas</Text>
              <TouchableOpacity
                style={styles.viewAllDuasButton}
                onPress={() => router.push("/duas" as any)}
              >
                <Text style={styles.viewAllDuasButtonText}>View All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.duasHorizontalScroll}
            >
              {duas.map((dua) => (
                <View key={dua.id} style={styles.duaCard}>
                  <Text style={styles.duaCardTitle}>{dua.title}</Text>
                  <Text style={styles.duaCardArabic}>{dua.arabic}</Text>
                  <Text style={styles.duaCardTranslation}>
                    {dua.translation}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Today's Plan Section */}
          <View style={styles.todayPlanSection}>
            <View style={styles.todayPlanHeader}>
              <Calendar size={24} color="#0D7C66" strokeWidth={2.5} />
              <Text style={styles.todayPlanTitle}>Today's Plan</Text>
            </View>

            <View style={styles.checklistContainer}>
              <View style={styles.checklistItem}>
                <View style={styles.checkboxUnchecked}>
                  <Text style={styles.checkboxText}></Text>
                </View>
                <View style={styles.checklistItemContent}>
                  <Text style={styles.checklistItemTitle}>Fajr Prayer</Text>
                  <Text style={styles.checklistItemTime}>
                    5:15 AM • Masjid Al-Haram
                  </Text>
                </View>
              </View>

              <View style={styles.checklistItem}>
                <View style={styles.checkboxUnchecked}>
                  <Text style={styles.checkboxText}></Text>
                </View>
                <View style={styles.checklistItemContent}>
                  <Text style={styles.checklistItemTitle}>Group Breakfast</Text>
                  <Text style={styles.checklistItemTime}>
                    8:00 AM • Meet at camp
                  </Text>
                </View>
              </View>

              <View style={styles.checklistItem}>
                <View style={styles.checkboxChecked}>
                  <Text style={styles.checkboxTextChecked}>✓</Text>
                </View>
                <View style={styles.checklistItemContentCompleted}>
                  <Text style={styles.checklistItemTitleCompleted}>
                    Zuhr Prayer
                  </Text>
                  <Text style={styles.checklistItemTime}>
                    2:00 PM • Masjid Bilal
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.addNewPlanButton}
              onPress={() => router.push("/daily-plan" as any)}
            >
              <Text style={styles.addNewPlanButtonText}>+ Add New Plan</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Ritual Guide Section */}
          <View style={styles.ritualGuideSection}>
            <View style={styles.ritualGuideHeader}>
              <BookMarked size={24} color="#0D7C66" strokeWidth={2.5} />
              <Text style={styles.ritualGuideTitle}>Ritual Guide</Text>
            </View>

            <View style={styles.ritualsContainer}>
              <View style={styles.ritualCardItem}>
                <View style={styles.ritualCardContent}>
                  <Text style={styles.ritualCardTitle}>Ihram</Text>
                  <Text style={styles.ritualCardDesc}>
                    Enter sacred state with cleansing and intention
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.ritualCardPlus}
                  onPress={() => router.push("/ritual-guide" as any)}
                >
                  <Text style={styles.ritualCardPlusText}>+</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.ritualCardItem}>
                <View style={styles.ritualCardContent}>
                  <Text style={styles.ritualCardTitle}>Tawaf</Text>
                  <Text style={styles.ritualCardDesc}>
                    Circumambulate the Kaaba seven times
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.ritualCardPlus}
                  onPress={() => router.push("/ritual-guide" as any)}
                >
                  <Text style={styles.ritualCardPlusText}>+</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.ritualCardItem}>
                <View style={styles.ritualCardContent}>
                  <Text style={styles.ritualCardTitle}>Sai</Text>
                  <Text style={styles.ritualCardDesc}>
                    Walk between Safa and Marwa seven times
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.ritualCardPlus}
                  onPress={() => router.push("/ritual-guide" as any)}
                >
                  <Text style={styles.ritualCardPlusText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Donation Section */}
          <View style={styles.donationSection}>
            <View style={styles.donationIconContainer}>
              <Heart
                size={48}
                color="#FF6B6B"
                strokeWidth={2.5}
                fill="#FF6B6B"
              />
            </View>

            <Text style={styles.donationTitle}>
              Help Others on Their Journey
            </Text>

            <Text style={styles.donationDescription}>
              Your generous donation supports pilgrims in need, providing meals,
              transportation, and medical assistance during Hajj. Every
              contribution makes a meaningful difference in their spiritual
              journey.
            </Text>

            <TouchableOpacity style={styles.donateButton}>
              <Heart
                size={18}
                color="#FFFFFF"
                strokeWidth={2.5}
                fill="#FFFFFF"
              />
              <Text style={styles.donateButtonText}>Donate Now</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider} />
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
    height: 400,
    backgroundColor: "#0D7C66",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInitials: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#0D7C66",
  },
  groupCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  groupInfo: {
    marginLeft: 12,
  },
  groupLabel: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#666666",
    marginBottom: 2,
  },
  groupCode: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#0D7C66",
    letterSpacing: 2,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginBottom: 16,
    marginLeft: 24,
  },

  // Horizontal Menu Styles
  menuSection: {
    marginBottom: 32,
  },
  horizontalScroll: {
    paddingHorizontal: 24,
    gap: 12,
  },
  horizontalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    minWidth: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  horizontalIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  horizontalCardTitle: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#1A1A1A",
    textAlign: "center",
  },

  // Map Section Styles
  mapSection: {
    marginHorizontal: 24,
    marginBottom: 32,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  mapContainer: {
    height: 180,
    width: "100%",
    backgroundColor: "#F0F8F6",
  },
  mapCardInfo: {
    padding: 20,
  },
  mapCardTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginBottom: 8,
  },
  mapCardDescription: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#666666",
    lineHeight: 20,
    marginBottom: 16,
  },
  mapActionButton: {
    backgroundColor: "#0D7C66",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  mapActionButtonText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },

  // Announcement Section Styles
  announcementSection: {
    marginHorizontal: 24,
    marginBottom: 32,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  announcementHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  announcementTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginLeft: 12,
  },
  chatContainer: {
    marginBottom: 16,
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 12,
  },
  chatMessage: {
    flexDirection: "row",
    width: "100%",
  },
  senderAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0D7C66",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 0,
  },
  senderAvatarText: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0D7C66",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 0,
  },
  userAvatarText: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  messageBubble: {
    maxWidth: "75%",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  senderName: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: "#0D7C66",
    marginBottom: 4,
  },
  messageText: {
    fontSize: 13,
    fontWeight: "500" as const,
    lineHeight: 18,
  },
  messageTime: {
    fontSize: 11,
    fontWeight: "400" as const,
    marginTop: 4,
  },
  announcementList: {
    marginBottom: 16,
  },
  announcementItem: {
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  announcementBubble: {
    flex: 1,
    backgroundColor: "#F0F8F6",
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#0D7C66",
  },
  announcementItemTitle: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: "#0D7C66",
    marginBottom: 4,
  },
  announcementItemMessage: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#666666",
    lineHeight: 18,
  },
  announcementTime: {
    fontSize: 11,
    fontWeight: "500" as const,
    color: "#AAAAAA",
    marginTop: 4,
  },
  viewAllButton: {
    backgroundColor: "#F0F8F6",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#0D7C66",
    alignItems: "center",
  },
  viewAllButtonText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#0D7C66",
  },

  // Facilities Section Styles
  facilitiesSection: {
    marginBottom: 32,
  },
  facilityCard: {
    alignItems: "center",
    marginRight: 12,
  },
  facilityImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 10,
  },
  facilityCardTitle: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#1A1A1A",
    textAlign: "center",
    width: 120,
  },

  // Nearby Places Card Styles
  nearbyPlacesCard: {
    marginHorizontal: 24,
    marginBottom: 32,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: "#E8E8E8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  nearbyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  nearbyTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginLeft: 12,
  },
  nearbyDescription: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#666666",
    lineHeight: 20,
    marginBottom: 16,
  },
  exploreButton: {
    backgroundColor: "#0D7C66",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  exploreButtonText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },

  // Old styles kept for compatibility
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 24,
  },
  card: {
    width: "47%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#1A1A1A",
    textAlign: "center",
  },
  tipCard: {
    flexDirection: "row",
    backgroundColor: "#E6F7F4",
    borderRadius: 16,
    padding: 20,
    alignItems: "flex-start",
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500" as const,
    color: "#0D7C66",
    lineHeight: 22,
    marginLeft: 12,
  },
  premiumNoticeCard: {
    backgroundColor: "#EBF5F2",
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#F59E0B",
    shadowColor: "#0D7C66",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  premiumNoticeContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  premiumNoticeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    marginTop: 4,
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  premiumNoticeText: {
    flex: 1,
  },
  premiumNoticeTitle: {
    fontSize: 18,
    fontWeight: "800" as const,
    color: "#0D7C66",
    marginBottom: 4,
  },
  premiumNoticeSubtitle: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#2D6A5C",
    lineHeight: 19,
  },
  upgradeButton: {
    backgroundColor: "#FEF3C7",
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 28,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    borderWidth: 1,
    borderColor: "#F59E0B",
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 6,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#92400E",
    marginBottom: 2,
  },

  // Divider Style
  divider: {
    height: 1,
    backgroundColor: "#E8E8E8",
    marginVertical: 28,
    marginHorizontal: 24,
  },

  // Prayer Times Section Styles
  prayerSection: {
    marginHorizontal: 24,
    marginBottom: 32,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  prayerClockContainer: {
    alignItems: "center",
    marginBottom: 20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F0F8F6",
    justifyContent: "center",
    alignSelf: "center",
    shadowColor: "#0D7C66",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  prayerInfoCard: {
    alignItems: "center",
  },
  prayerCardTitle: {
    fontSize: 20,
    fontWeight: "800" as const,
    color: "#1A1A1A",
    marginBottom: 8,
    textAlign: "center",
  },
  prayerCardDescription: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#666666",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  prayerActionButton: {
    backgroundColor: "#0D7C66",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    shadowColor: "#0D7C66",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  prayerActionButtonText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },

  // Duas Section Styles
  duasMainSection: {
    marginHorizontal: 24,
    marginBottom: 32,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  duasHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  duasHeaderTitle: {
    fontSize: 20,
    fontWeight: "800" as const,
    color: "#1A1A1A",
    marginLeft: 12,
  },
  quranVerseCard: {
    backgroundColor: "#F0F8F6",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#0D7C66",
    alignItems: "center",
  },
  quranVerseArabic: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#0D7C66",
    marginBottom: 8,
    textAlign: "center",
    lineHeight: 24,
  },
  quranVerseTranslation: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#2D6A5C",
    marginBottom: 8,
    textAlign: "center",
    lineHeight: 20,
    fontStyle: "italic",
  },
  quranVerseReference: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: "#888888",
    textAlign: "center",
  },
  duasSubtitle: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginBottom: 12,
  },
  duasSubtitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  viewAllDuasButton: {
    backgroundColor: "#F0F8F6",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    marginBottom: 6,
    borderColor: "#0D7C66",
    alignItems: "center",
    justifyContent: "center",
  },

  viewAllDuasButtonText: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: "#0D7C66",
  },
  duasHorizontalScroll: {
    paddingRight: 24,
    gap: 12,
  },
  duaCard: {
    backgroundColor: "#EBF5F2",
    borderRadius: 14,
    padding: 14,
    minWidth: 160,
    marginLeft: 0,
    borderWidth: 1,
    borderColor: "#D4E8E3",
  },
  duaCardTitle: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: "#0D7C66",
    marginBottom: 8,
  },
  duaCardArabic: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#1A1A1A",
    marginBottom: 6,
    lineHeight: 18,
    textAlign: "center",
  },
  duaCardTranslation: {
    fontSize: 11,
    fontWeight: "500" as const,
    color: "#666666",
    lineHeight: 15,
    fontStyle: "italic",
  },

  // Today's Plan Section Styles
  todayPlanSection: {
    marginHorizontal: 0,
    marginBottom: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 0,
    padding: 24,
    paddingBottom: 32,
    shadowColor: "transparent",
    elevation: 0,
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
  },
  todayPlanHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  todayPlanTitle: {
    fontSize: 20,
    fontWeight: "800" as const,
    color: "#1A1A1A",
    marginLeft: 12,
  },
  checklistContainer: {
    marginBottom: 20,
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  checkboxUnchecked: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#0D7C66",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  checkboxChecked: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#0D7C66",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0D7C66",
  },
  checkboxText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#0D7C66",
  },
  checkboxTextChecked: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  checklistItemContent: {
    flex: 1,
  },
  checklistItemContentCompleted: {
    flex: 1,
    opacity: 0.6,
  },
  checklistItemTitle: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginBottom: 4,
  },
  checklistItemTitleCompleted: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginBottom: 4,
    textDecorationLine: "line-through" as const,
  },
  checklistItemTime: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: "#999999",
  },
  addNewPlanButton: {
    backgroundColor: "#F0F8F6",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#0D7C66",
    borderStyle: "dashed" as const,
  },
  addNewPlanButtonText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#0D7C66",
  },

  // Ritual Guide Section Styles
  ritualGuideSection: {
    marginHorizontal: 0,
    marginBottom: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 0,
    padding: 24,
    paddingBottom: 32,
    shadowColor: "transparent",
    elevation: 0,
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
  },
  ritualGuideHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  ritualGuideTitle: {
    fontSize: 20,
    fontWeight: "800" as const,
    color: "#1A1A1A",
    marginLeft: 12,
  },
  ritualsContainer: {
    gap: 16,
  },
  ritualCardItem: {
    backgroundColor: "#F0F8F6",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderLeftWidth: 4,
    borderLeftColor: "#0D7C66",
  },
  ritualCardContent: {
    flex: 1,
  },
  ritualCardTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#0D7C66",
    marginBottom: 6,
  },
  ritualCardDesc: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#666666",
    lineHeight: 18,
  },
  ritualCardPlus: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0D7C66",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  ritualCardPlusText: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },

  // Donation Section Styles
  donationSection: {
    marginHorizontal: 24,
    marginBottom: 32,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFE8E8",
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  donationIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFE8E8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  donationTitle: {
    fontSize: 20,
    fontWeight: "800" as const,
    color: "#1A1A1A",
    marginBottom: 12,
    textAlign: "center",
  },
  donationDescription: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#666666",
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 22,
  },
  donateButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  donateButtonText: {
    fontSize: 16,
    fontWeight: "800" as const,
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
});
