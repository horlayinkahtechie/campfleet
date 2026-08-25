import { db } from "@/lib/firebase";
import { useLocalSearchParams, useRouter } from "expo-router";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { ChevronLeft, User as UserIcon } from "lucide-react-native";
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

export default function UserListScreen() {
  const { userId, type } = useLocalSearchParams(); // type is 'followers' or 'following'
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        let userList = [];

        if (type === "following") {
          // Path: users/{userId}/following/
          const snap = await getDocs(
            collection(db, "users", userId, "following"),
          );
          userList = snap.docs.map((d) => d.id);
        } else {
          // Path: Get everyone who follows THIS user
          // Note: This depends on if you store followers in a sub-collection
          // or a top-level 'follows' collection.
          const snap = await getDocs(
            collection(db, "users", userId, "followers"),
          );
          userList = snap.docs.map((d) => d.id);
        }

        // Fetch full profiles for the IDs found
        const profilePromises = userList.map(async (id) => {
          const userDoc = await getDoc(doc(db, "users", id));
          return { id, ...userDoc.data() };
        });

        const profiles = await Promise.all(profilePromises);
        setUsers(profiles);
      } catch (error) {
        console.error("Error fetching list:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [userId, type]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft color="white" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {type === "followers" ? "Followers" : "Following"}
        </Text>
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
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.userCard}
              onPress={() => router.push(`profile/${item.id}`)}
            >
              <View style={styles.avatarContainer}>
                {item.avatar ? (
                  <Image source={{ uri: item.avatar }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <UserIcon color="#9ca3af" size={20} />
                  </View>
                )}
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name || "User"}</Text>
                <Text style={styles.userHandle}>
                  @{item.username || "username"}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No {type} found.</Text>
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
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#111",
    padding: 12,
    borderRadius: 12,
  },
  avatar: { width: 45, height: 45, borderRadius: 22.5 },
  avatarPlaceholder: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center",
  },
  userInfo: { marginLeft: 15, flex: 1 },
  userName: { color: "white", fontWeight: "bold", fontSize: 16 },
  userHandle: { color: "#9ca3af", fontSize: 14 },
  emptyText: { color: "#4b5563", textAlign: "center", marginTop: 50 },
});
