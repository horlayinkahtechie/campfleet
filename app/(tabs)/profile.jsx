import { auth, db } from "@/lib/firebase";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { Calendar, LogOut, Phone, Settings } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Posts");
  const [data, setData] = useState([]);
  const [tabLoading, setTabLoading] = useState(false);

  // 1. Real-time User Data Listener
  useEffect(() => {
    if (!auth.currentUser) return;

    const unsub = onSnapshot(doc(db, "users", auth.currentUser.uid), (doc) => {
      if (doc.exists()) {
        setUserData(doc.data());
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // 2. Fetch Tab Content (Posts, Reposts, or Media)
  useEffect(() => {
    const fetchTabContent = async () => {
      setTabLoading(true);
      try {
        const colName = activeTab === "Reposts" ? "reposts" : "posts";
        let q;

        if (activeTab === "Media") {
          // Query posts that have images
          q = query(
            collection(db, "posts"),
            where("user_id", "==", auth.currentUser.uid),
            where("images", "!=", []),
            orderBy("images"),
            orderBy("timestamp", "desc"),
          );
        } else {
          q = query(
            collection(db, colName),
            where("user_id", "==", auth.currentUser.uid),
            orderBy("timestamp", "desc"),
          );
        }

        const snap = await getDocs(q);
        setData(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (e) {
        console.error("Tab Fetch Error:", e);
      } finally {
        setTabLoading(false);
      }
    };

    fetchTabContent();
  }, [activeTab]);

  const handleShare = async () => {
    try {
      const profileLink = `https://campfleet.app/profile/${userData?.username}`;
      await Share.share({
        message: `Check out ${userData?.name}'s profile on Campfleet: ${profileLink}`,
        url: profileLink,
        title: "Campfleet Profile",
      });
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await signOut(auth);
          router.replace("/authscreen/signin/Signin");
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color="#6366f1" size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Header Bar */}
      <View style={styles.header}>
        <Text style={styles.username}>@{userData?.username || "user"}</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={handleLogout} style={styles.iconBtn}>
            <LogOut size={22} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push("/settings/Settings")}
          >
            <Settings size={22} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Info */}
      <View style={styles.profileSection}>
        <View style={styles.avatarWrapper}>
          {userData?.avatar ? (
            <Image source={{ uri: userData.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]} />
          )}
        </View>

        <View style={styles.nameSection}>
          <View style={styles.nameRow}>
            <Text style={styles.fullName}>{userData?.name}</Text>
          </View>
          <Text style={styles.subInfo}>
            {userData?.department || "No Department"} •{" "}
            {userData?.institution || "No Institution"}
          </Text>
        </View>
      </View>

      {/* Bio */}
      <View style={styles.bioSection}>
        <Text style={styles.bioText}>{userData?.bio}</Text>
      </View>

      {/* Interests Section */}
      {userData?.interests && userData.interests.length > 0 && (
        <View style={styles.interestsContainer}>
          {userData.interests.slice(0, 3).map((interest, index) => (
            <View key={index} style={styles.interestPill}>
              <Text style={styles.interestText}>{interest}</Text>
            </View>
          ))}
          {userData.interests.length > 3 && (
            <Text style={styles.moreInterests}>
              +{userData.interests.length - 3} more
            </Text>
          )}
        </View>
      )}

      {/* Metadata Row (Joined Date) */}
      <View style={styles.metaDataRow}>
        <View style={styles.metaItem}>
          <Calendar size={14} color="#9ca3af" />
          <Text style={styles.metaText}>
            Joined{" "}
            {userData?.created_at
              ? new Date(userData.created_at.seconds * 1000).toLocaleDateString(
                  "en-US",
                  { month: "long", year: "numeric" },
                )
              : "Recent"}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Phone size={14} color="#9ca3af" />
          <Text style={styles.metaText}>{userData?.phone_number}</Text>
        </View>
      </View>
      <View style={styles.metaDataRow}></View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{userData?.posts_count || 0}</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>

        {/* Followers */}
        <TouchableOpacity
          style={styles.statBox}
          onPress={() =>
            router.push({
              pathname: "profile/FollowersLists",
              params: { userId: auth.currentUser?.uid, type: "followers" },
            })
          }
        >
          <Text style={styles.statNumber}>
            {userData?.followers_count || 0}
          </Text>
          <Text style={styles.statLabel}>Followers</Text>
        </TouchableOpacity>

        {/* Following */}
        <TouchableOpacity
          style={styles.statBox}
          onPress={() =>
            router.push({
              pathname: "profile/FollowingLists",
              params: { userId: auth.currentUser?.uid, type: "following" },
            })
          }
        >
          <Text style={styles.statNumber}>
            {userData?.following_count || 0}
          </Text>
          <Text style={styles.statLabel}>Following</Text>
        </TouchableOpacity>
      </View>

      {/* Actions */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => router.push("profile/EditProfile")}
        >
          <Text style={styles.editBtnText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Text style={styles.shareBtnText}>Share Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabContainer}>
        {["Posts", "Replies", "Media"].map((tab) => {
          const tabKey = tab === "Replies" ? "Reposts" : tab;
          const isActive = activeTab === tabKey;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tabKey)}
              style={[styles.tabButton, isActive && styles.activeTab]}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List Content */}
      {tabLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#6366f1" />
      ) : data.length > 0 ? (
        <View style={styles.feed}>
          {data.map((item) => (
            <View key={item.id} style={styles.postCard}>
              <Text style={styles.postContent}>{item.content}</Text>
              <View style={styles.postFooter}>
                <Text style={styles.footerText}>
                  {item.likes_count || 0} Likes
                </Text>
                <Text style={styles.footerText}>
                  {item.repost_count || 0} Reposts
                </Text>
                <Text style={styles.footerText}>
                  {item.comment_count || 0} Comments
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>
            No {activeTab.toLowerCase()} yet
          </Text>
          <Text style={styles.emptySubText}>
            When you share content, it will appear here.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  center: { justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
  },
  username: { color: "white", fontSize: 18, fontWeight: "bold" },
  headerIcons: { flexDirection: "row" },
  iconBtn: { marginLeft: 20 },
  profileSection: {
    flexDirection: "row",
    paddingHorizontal: 20,
    alignItems: "center",
    // marginTop: 10,
  },
  avatarWrapper: {
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  avatar: { width: 90, height: 90, borderRadius: 45 },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#333",
  },
  nameSection: { marginLeft: 20, flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center" },
  fullName: { color: "white", fontSize: 20, fontWeight: "bold" },
  subInfo: { color: "#9ca3af", fontSize: 14, marginTop: 4 },
  bioSection: { paddingHorizontal: 20, marginTop: 20 },
  bioText: { color: "white", fontSize: 14, lineHeight: 20 },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  statBox: { alignItems: "center", flex: 1, flexDirection: "row", gap: 5 },
  statNumber: { color: "white", fontSize: 15, fontWeight: "bold" },
  statLabel: { color: "#9ca3af", fontSize: 12, marginTop: 2 },
  actionRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 15,
    gap: 12,
  },
  editBtn: {
    flex: 1,
    backgroundColor: "#6366f1",
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  editBtnText: { color: "white", fontWeight: "bold", fontSize: 15 },
  shareBtn: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  shareBtnText: { color: "white", fontWeight: "bold", fontSize: 15 },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#222",
    marginTop: 15,
  },
  tabButton: { flex: 1, paddingVertical: 15, alignItems: "center" },
  activeTab: { borderBottomWidth: 3, borderBottomColor: "#6366f1" },
  tabText: { color: "#9ca3af", fontWeight: "600", fontSize: 15 },
  activeTabText: { color: "white" },
  postCard: { padding: 20, borderBottomWidth: 1, borderBottomColor: "#111" },
  postContent: { color: "white", fontSize: 16, lineHeight: 22 },
  postFooter: { flexDirection: "row", marginTop: 12, gap: 15 },
  footerText: { color: "#4b5563", fontSize: 12 },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    marginTop: 60,
  },
  emptyTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptySubText: { color: "#9ca3af", fontSize: 14, textAlign: "center" },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    marginTop: 12,
    alignItems: "center",
    gap: 8,
  },
  interestPill: {
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#333",
  },
  interestText: {
    color: "#6366f1", // Campfleet theme color
    fontSize: 12,
    fontWeight: "600",
  },
  moreInterests: {
    color: "#4b5563",
    fontSize: 12,
  },
  metaDataRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 15,
    gap: 15,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    color: "#9ca3af",
    fontSize: 13,
  },
});
