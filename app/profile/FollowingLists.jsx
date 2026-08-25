import { db } from "@/lib/firebase";
import { useLocalSearchParams, useRouter } from "expo-router";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { ChevronLeft, User } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function FollowingListScreen() {
  const { userId } = useLocalSearchParams();
  const router = useRouter();
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        // 1. Get the IDs of everyone the user follows
        // Assuming structure: users/{userId}/following/{followedUserId}
        const followingRef = collection(db, "users", userId, "following");
        const snapshot = await getDocs(followingRef);

        const followingData = await Promise.all(
          snapshot.docs.map(async (followingDoc) => {
            // 2. Fetch the actual user profile for each ID
            const userProfile = await getDoc(doc(db, "users", followingDoc.id));
            return { id: followingDoc.id, ...userProfile.data() };
          }),
        );

        setFollowing(followingData);
      } catch (error) {
        console.error("Error fetching following:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowing();
  }, [userId]);

  const renderUser = ({ item }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => router.push(`profile/${item.id}`)}
    >
      {item.avatar ? (
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <User color="#9ca3af" size={20} />
        </View>
      )}
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name || "Unknown User"}</Text>
        <Text style={styles.userHandle}>@{item.username || "user"}</Text>
      </View>
      <TouchableOpacity style={styles.followingBadge}>
        <Text style={styles.followingBadgeText}>Following</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft color="white" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Following</Text>
        <View style={{ width: 28 }} />
      </View>

      {loading ? (
        <ActivityIndicator
          color="#6366f1"
          size="large"
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={following}
          keyExtractor={(item) => item.id}
          renderItem={renderUser}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Not following anyone yet.</Text>
          }
          contentContainerStyle={{ padding: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "bold" },
  userCard: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
  },
  userInfo: { marginLeft: 15, flex: 1 },
  userName: { color: "white", fontWeight: "bold", fontSize: 16 },
  userHandle: { color: "#9ca3af", fontSize: 14 },
  followingBadge: {
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
  },
  followingBadgeText: { color: "white", fontSize: 12, fontWeight: "600" },
  emptyText: { color: "#4b5563", textAlign: "center", marginTop: 50 },
});
