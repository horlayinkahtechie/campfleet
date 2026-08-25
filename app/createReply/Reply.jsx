import { auth, db } from "@/lib/firebase";
import { useLocalSearchParams, useRouter } from "expo-router";

import {
  addDoc,
  collection,
  doc,
  increment,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import {
  BarChart2,
  Image as ImageIcon,
  Shield,
  Video,
  X,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { showMessage } from "react-native-flash-message";

export default function Reply() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const { postId } = useLocalSearchParams();
  const [text, setText] = useState("");

  const router = useRouter();
  const submitReply = async () => {
    const user = auth.currentUser;
    // 1. Add comment to subcollection
    await addDoc(collection(db, "posts", postId, "comments"), {
      userId: user.uid,
      username: user.displayName,
      content: text,
      timestamp: serverTimestamp(),
    });

    // 2. Increment parent post count
    await updateDoc(doc(db, "posts", postId), {
      comment_count: increment(1),
    });

    showMessage({ message: "Reply sent", type: "info" });
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <X color="white" size={24} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.postBtn, !content.trim() && styles.disabledBtn]}
          onPress={submitReply}
          disabled={!content.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.postBtnText}>Reply</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Input Area */}
      <View style={styles.inputSection}>
        <TextInput
          style={styles.textInput}
          placeholder="Reply with what's on your mind."
          placeholderTextColor="#4b5563"
          multiline
          autoFocus
          value={content}
          onChangeText={setContent}
          maxLength={280}
        />
      </View>

      {/* Toolbar - Matching your image_8cbd65.png footer */}
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolBtn}>
          <ImageIcon color="#6366f1" size={22} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn}>
          <Video color="#6366f1" size={22} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn}>
          <BarChart2 color="#6366f1" size={22} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn}>
          <Shield color="#6366f1" size={22} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", paddingTop: 30 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  postBtn: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  disabledBtn: { opacity: 0.5 },
  postBtnText: { color: "white", fontWeight: "bold" },
  inputSection: { flexDirection: "row", paddingHorizontal: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#333" },
  textInput: {
    flex: 1,
    color: "white",
    fontSize: 18,
    marginLeft: 12,
    textAlignVertical: "top",
    paddingTop: 8,
  },
  toolbar: {
    flexDirection: "row",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#111",
    position: "absolute",
    bottom: 0,
    width: "100%",
    justifyContent: "space-around",
  },
  toolBtn: { padding: 10, backgroundColor: "#111", borderRadius: 10 },
});
