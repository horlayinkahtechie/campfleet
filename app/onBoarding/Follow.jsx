import { OnboardingLayout } from "@/components/OnBoardingLayout";
import { auth, db, storage } from "@/lib/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  query,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { UserCheck, UserPlus } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const StudentItem = ({ item, currentUserId }) => {
  const [following, setFollowing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(true); // Start true to check DB

  // Unique ID for the relationship: "myID_targetID"
  const followDocId = `${currentUserId}_${item.id}`;
  const followRef = doc(db, "follows", followDocId);

  // 1. Check if already following on mount
  useEffect(() => {
    const checkFollowStatus = async () => {
      try {
        const docSnap = await getDoc(followRef);
        if (docSnap.exists()) {
          setFollowing(true);
        }
      } catch (error) {
        console.error("Error checking follow status:", error);
      } finally {
        setIsProcessing(false);
      }
    };
    checkFollowStatus();
  }, [item.id]);

  const toggleFollow = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const batch = writeBatch(db);
      const targetUserRef = doc(db, "users", item.id);
      const currentUserRef = doc(db, "users", currentUserId);

      if (!following) {
        // --- FOLLOW LOGIC ---
        batch.set(followRef, {
          followerId: currentUserId,
          followingId: item.id,
          timestamp: new Date(),
        });
        batch.update(targetUserRef, { followers_count: increment(1) });
        batch.update(currentUserRef, { following_count: increment(1) });
      } else {
        // --- UNFOLLOW LOGIC ---
        batch.delete(followRef);
        batch.update(targetUserRef, { followers_count: increment(-1) });
        batch.update(currentUserRef, { following_count: increment(-1) });
      }

      await batch.commit();
      setFollowing(!following);
    } catch (error) {
      console.error("Follow error:", error);
      Alert.alert("Error", "Could not update follow status");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.row}>
      {item.avatar ? (
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, { backgroundColor: "#333" }]} />
      )}
      <View style={styles.info}>
        <Text style={styles.name}>{item.name || "Student"}</Text>
        <Text style={styles.handle}>
          @{item.username || "user"} •{" "}
          {item.dept || item.department || "No Dept"}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.followBtn, following && styles.followingBtn]}
        onPress={toggleFollow}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <ActivityIndicator size={12} color="white" />
        ) : (
          <>
            {following ? (
              <UserCheck size={16} color="white" />
            ) : (
              <UserPlus size={16} color="white" />
            )}
            <Text style={styles.followText}>
              {following ? "Following" : "Follow"}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default function FollowStudentsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const q = query(
          collection(db, "users"),
          where("__name__", "!=", auth.currentUser.uid),
          limit(15),
        );
        const querySnapshot = await getDocs(q);
        const studentsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStudents(studentsList);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setFetching(false);
      }
    };
    fetchStudents();
  }, []);

  const handleFinish = async () => {
    setLoading(true);
    try {
      const keys = [
        "onboarding_institution",
        "onboarding_department",
        "onboarding_interests",
        "onboarding_photo",
      ];
      const [inst, dept, interestsRaw, photo] = await Promise.all(
        keys.map((k) => AsyncStorage.getItem(k)),
      );

      const updateData = {
        institution: inst || "",
        department: dept || "",
        interests: interestsRaw ? JSON.parse(interestsRaw) : [],
        onboarding_completed: true,
      };

      if (photo) {
        const res = await fetch(photo);
        const blob = await res.blob();
        const storageRef = ref(storage, `avatars/${auth.currentUser.uid}`);
        await uploadBytes(storageRef, blob);
        updateData.avatar = await getDownloadURL(storageRef);
      }

      await updateDoc(doc(db, "users", auth.currentUser.uid), updateData);
      await AsyncStorage.multiRemove(keys);

      router.replace("/(tabs)/home");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Finalization Failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout
      step={5}
      title="Follow Students"
      subtitle="Start building your network"
      onContinue={handleFinish}
      continueDisabled={loading}
      scrollable={false}
    >
      {fetching ? (
        <ActivityIndicator
          size="large"
          color="#6366f1"
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <StudentItem item={item} currentUserId={auth.currentUser.uid} />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          ListEmptyComponent={
            <Text style={{ color: "#aaa", textAlign: "center", marginTop: 20 }}>
              No students found.
            </Text>
          }
        />
      )}

      {loading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loaderText}>Setting up your profile...</Text>
        </View>
      )}
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#111",
  },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  info: { flex: 1, marginLeft: 16 },
  name: { color: "white", fontWeight: "bold" },
  handle: { color: "#9ca3af", fontSize: 12 },
  followBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6366f1",
    padding: 8,
    borderRadius: 8,
  },
  followingBtn: { backgroundColor: "#1f1f1f" },
  followText: { color: "white", marginLeft: 4 },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  loaderText: { color: "white", marginTop: 10 },
});
