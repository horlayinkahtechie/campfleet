import { auth, db } from "@/lib/firebase";
import { useRouter } from "expo-router";
import { deleteUser, sendPasswordResetEmail, updateEmail } from "firebase/auth";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { ChevronLeft, Lock, Trash2 } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SettingsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form States
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");

  // 1. Reset Password
  const handlePasswordReset = async () => {
    if (!auth.currentUser?.email) return;
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, auth.currentUser.email);
      Alert.alert("Success", "Password reset link sent to your email.");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Update Email
  const handleUpdateEmail = async () => {
    if (!newEmail.includes("@")) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      await updateEmail(auth.currentUser, newEmail);
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        email: newEmail,
      });
      Alert.alert("Success", "Email updated successfully.");
      setNewEmail("");
    } catch (error) {
      if (error.code === "auth/requires-recent-login") {
        Alert.alert(
          "Security Check",
          "Please log out and log back in to change your email.",
        );
      } else {
        Alert.alert("Error", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // 3. Update Phone Number (Firestore)
  const handleUpdatePhone = async () => {
    if (newPhone.length < 10) {
      Alert.alert("Error", "Please enter a valid phone number.");
      return;
    }
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        phone_number: newPhone,
      });
      Alert.alert("Success", "Phone number updated.");
      setNewPhone("");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  // 4. Delete Account
  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action is permanent. All your data will be erased. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete My Account",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              const user = auth.currentUser;
              if (user) {
                // Delete from Firestore first
                await deleteDoc(doc(db, "users", user.uid));
                // Delete from Auth
                await deleteUser(user);
                router.replace("/welcome"); // Route back to Welcome screen
              }
            } catch (error) {
              if (error.code === "auth/requires-recent-login") {
                Alert.alert(
                  "Security Check",
                  "Re-authentication required. Please log in again before deleting.",
                );
              } else {
                Alert.alert("Error", error.message);
              }
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft color="white" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Settings</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Password Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handlePasswordReset}
          >
            <View style={styles.iconWrapper}>
              <Lock color="#6366f1" size={20} />
            </View>
            <View style={styles.itemContent}>
              <Text style={styles.itemTitle}>Reset Password</Text>
              <Text style={styles.itemSub}>
                Send a reset link to your email
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Email Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Email Address</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter new email"
              placeholderTextColor="#4b5563"
              value={newEmail}
              onChangeText={setNewEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={handleUpdateEmail}
            >
              <Text style={styles.actionBtnText}>Update</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Phone Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phone Number</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="e.g. +234 800 000 0000"
              placeholderTextColor="#4b5563"
              value={newPhone}
              onChangeText={setNewPhone}
              keyboardType="phone-pad"
            />
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={handleUpdatePhone}
            >
              <Text style={styles.actionBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={[styles.section, { marginTop: 40 }]}>
          <Text style={[styles.sectionTitle, { color: "#ef4444" }]}>
            Danger Zone
          </Text>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={handleDeleteAccount}
          >
            <Trash2 color="#ef4444" size={20} />
            <Text style={styles.deleteBtnText}>Delete Account Permanently</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <ActivityIndicator
            color="#6366f1"
            size="large"
            style={{ marginTop: 20 }}
          />
        )}
      </ScrollView>
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
  scrollContent: { padding: 20 },
  section: { marginBottom: 30 },
  sectionTitle: {
    color: "#9ca3af",
    fontSize: 13,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 15,
    letterSpacing: 1,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    padding: 16,
    borderRadius: 12,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#1a1a2e",
    justifyContent: "center",
    alignItems: "center",
  },
  itemContent: { marginLeft: 15 },
  itemTitle: { color: "white", fontSize: 16, fontWeight: "600" },
  itemSub: { color: "#4b5563", fontSize: 13, marginTop: 2 },
  inputContainer: { flexDirection: "row", gap: 10 },
  input: {
    flex: 1,
    backgroundColor: "#111",
    borderRadius: 12,
    padding: 16,
    color: "white",
    borderWidth: 1,
    borderColor: "#222",
  },
  actionBtn: {
    backgroundColor: "#6366f1",
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  actionBtnText: { color: "white", fontWeight: "bold" },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1a0000",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#450a0a",
  },
  deleteBtnText: { color: "#ef4444", fontWeight: "bold", marginLeft: 10 },
});
