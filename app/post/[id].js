import { db } from "@/lib/firebase";
import { router, useLocalSearchParams } from "expo-router";
import {
    collection,
    doc,
    getDoc,
    onSnapshot,
    orderBy,
    query,
} from "firebase/firestore";
import {
    ArrowLeft,
    Heart,
    MessageCircle,
    Repeat,
    Share,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function PostDetail() {
  const { id } = useLocalSearchParams(); // This gets the [id] from the URL
  const [mainPost, setMainPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    // 1. Fetch Main Post Data
    const fetchMainPost = async () => {
      const docRef = doc(db, "posts", id);
      const snap = await getDoc(docRef);
      if (snap.exists()) setMainPost({ id: snap.id, ...snap.data() });
    };

    // 2. Listen to Comments Subcollection
    const q = query(
      collection(db, "posts", id, "comments"),
      orderBy("timestamp", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(fetchedComments);
      setLoading(false);
    });

    fetchMainPost();
    return () => unsubscribe();
  }, [id]);

  if (loading)
    return (
      <ActivityIndicator
        style={{ flex: 1, backgroundColor: "#000" }}
        color="#6366f1"
      />
    );

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <ArrowLeft color="white" onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Post</Text>
      </View>

      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={() => (
          <View style={styles.mainPostContainer}>
            <View style={styles.userInfo}>
              <Image
                source={{ uri: mainPost?.user_avatar }}
                style={styles.largeAvatar}
              />
              <View>
                <Text style={styles.displayName}>{mainPost?.username}</Text>
                <Text style={styles.handle}>
                  @{mainPost?.username?.toLowerCase()}
                </Text>
              </View>
            </View>

            <Text style={styles.mainContent}>{mainPost?.content}</Text>

            <View style={styles.statsRow}>
              <Text style={styles.statText}>
                <Text style={styles.bold}>{mainPost?.repost_count || 0}</Text>{" "}
                Reposts
              </Text>
              <Text style={styles.statText}>
                <Text style={styles.bold}>{mainPost?.likes_count || 0}</Text>{" "}
                Likes
              </Text>
            </View>

            <View style={styles.divider} />

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <MessageCircle color="#71767b" size={22} />
              <Repeat color="#71767b" size={22} />
              <Heart color="#71767b" size={22} />
              <Share color="#71767b" size={22} />
            </View>
            <View style={styles.divider} />
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.commentItem}>
            <Image
              source={{ uri: item.user_avatar }}
              style={styles.commentAvatar}
            />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row" }}>
                <Text style={styles.displayName}>{item.username}</Text>
                <Text style={styles.handle}>
                  {" "}
                  @{item.username?.toLowerCase()}
                </Text>
              </View>
              <Text style={styles.commentText}>{item.content}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  // --- Header ---
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50, // Adjust for notch
    paddingHorizontal: 15,
    paddingBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#2f3336",
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 30,
  },

  // --- Main Post ---
  mainPostContainer: {
    padding: 15,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  largeAvatar: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    marginRight: 12,
    backgroundColor: "#222",
  },
  displayName: {
    color: "#e7e9ea",
    fontWeight: "bold",
    fontSize: 16,
  },
  handle: {
    color: "#71767b",
    fontSize: 15,
  },
  mainContent: {
    color: "#e7e9ea",
    fontSize: 20, // Larger for the main post
    lineHeight: 28,
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: "row",
    paddingVertical: 15,
    borderTopWidth: 0.5,
    borderTopColor: "#2f3336",
  },
  statText: {
    color: "#71767b",
    fontSize: 15,
    marginRight: 20,
  },
  bold: {
    color: "white",
    fontWeight: "bold",
  },
  divider: {
    height: 0.5,
    backgroundColor: "#2f3336",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
  },

  // --- Comments Section ---
  commentItem: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: "#2f3336",
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: "#222",
  },
  commentText: {
    color: "white",
    fontSize: 15,
    lineHeight: 20,
    marginTop: 2,
  },
});
