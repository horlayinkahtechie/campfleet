import { auth, db } from "@/lib/firebase";
import { router } from "expo-router";
import { sendEmailVerification } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { Mail, RefreshCw } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function VerifyEmail() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Handle the countdown timer for the resend button
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // 1. Function to check if user clicked the link
  const handleCheckVerification = async () => {
    setIsRefreshing(true);
    try {
      // Reload the user to get the latest 'emailVerified' status
      await auth.currentUser.reload();

      if (auth.currentUser.emailVerified) {
        // Sync Firestore
        await updateDoc(doc(db, "users", auth.currentUser.uid), {
          email_verified: true,
        });

        router.push("/onBoarding/Institution");
      } else {
        Alert.alert(
          "Not Verified",
          "Please click the link in your email first.",
        );
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  // 2. Function to Resend the Email
  const handleResendEmail = async () => {
    if (countdown > 0) return;

    setIsResending(true);
    try {
      await sendEmailVerification(auth.currentUser);
      Alert.alert(
        "Sent!",
        "A new verification link has been sent to your email.",
      );
      setCountdown(60); // Start a 60-second cooldown
    } catch (error) {
      if (error.code === "auth/too-many-requests") {
        Alert.alert(
          "Wait a moment",
          "Too many requests. Please try again later.",
        );
      } else {
        Alert.alert("Error", error.message);
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Mail size={80} color="#6366f1" />
        </View>

        <Text style={styles.title}>Verify your email</Text>
        <Text style={styles.subtitle}>
          We&apos;ve sent a link to{" "}
          <Text style={styles.emailText}>{auth.currentUser?.email}</Text>. Click
          it to continue.
        </Text>

        {/* Primary Button: Check if verified */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleCheckVerification}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>I&apos;ve Verified My Email</Text>
          )}
        </TouchableOpacity>

        {/* Secondary Button: Resend Email */}
        <TouchableOpacity
          style={[styles.resendButton, countdown > 0 && styles.disabledButton]}
          onPress={handleResendEmail}
          disabled={isResending || countdown > 0}
        >
          {isResending ? (
            <ActivityIndicator color="#9ca3af" />
          ) : (
            <View style={styles.row}>
              <RefreshCw
                size={18}
                color={countdown > 0 ? "#4b5563" : "#6366f1"}
              />
              <Text
                style={[
                  styles.resendText,
                  countdown > 0 && styles.disabledText,
                ]}
              >
                {countdown > 0
                  ? `Resend in ${countdown}s`
                  : "Resend Email Link"}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  iconContainer: {
    marginBottom: 32,
    backgroundColor: "#1e1e1e",
    padding: 30,
    borderRadius: 100,
  },
  title: { fontSize: 24, fontWeight: "bold", color: "white", marginBottom: 16 },
  subtitle: {
    fontSize: 16,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
  },
  emailText: { color: "white", fontWeight: "600" },
  primaryButton: {
    width: "100%",
    backgroundColor: "#6366f1",
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  resendButton: { paddingVertical: 12 },
  disabledButton: { opacity: 0.5 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  resendText: { color: "#6366f1", fontWeight: "600", fontSize: 15 },
  disabledText: { color: "#4b5563" },
});
