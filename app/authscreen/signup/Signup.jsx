import { auth, db } from "@/lib/firebase";
import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  XCircle,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Signup() {
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form States
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Username Logic States
  const [usernameAvailable, setUsernameAvailable] = useState(null); // null = idle, true = available, false = taken
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  // --- EFFECT: Real-time Username Check ---
  useEffect(() => {
    const checkUsername = async () => {
      const cleanUser = username.replace("@", "").trim().toLowerCase();

      if (cleanUser.length < 3) {
        setUsernameAvailable(null);
        return;
      }

      setIsCheckingUsername(true);
      try {
        const q = query(
          collection(db, "users"),
          where("username", "==", cleanUser),
        );
        const querySnapshot = await getDocs(q);

        // If empty, the username is available
        setUsernameAvailable(querySnapshot.empty);
      } catch (err) {
        console.error("Error checking username:", err);
      } finally {
        setIsCheckingUsername(false);
      }
    };

    // Debounce: Wait 500ms after user stops typing to check database
    const timeoutId = setTimeout(() => {
      checkUsername();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleContinue = async () => {
    if (!fullName || !email || !username || !password) {
      alert("Please fill in all fields");
      return;
    }

    if (usernameAvailable === false) {
      alert("This username is already taken");
      return;
    }

    setLoading(true);

    try {
      // 1. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );
      const user = userCredential.user;

      // 2. Send Verification Link
      await sendEmailVerification(user);

      // 3. Create User Document
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: fullName,
        email: email.trim().toLowerCase(),
        username: username.replace("@", "").toLowerCase().trim(),
        avatar: "",
        bio: "",
        department: "",
        institution: "",
        interests: [],
        followers_count: 0,
        following_count: 0,
        post_count: 0,
        is_verified: false,
        created_at: serverTimestamp(),
      });

      setLoading(false);
      router.push("/authscreen/verifyemail/VerifyEmail");
    } catch (error) {
      setLoading(false);
      alert(error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex1}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
        </View>

        <ScrollView
          style={styles.flex1}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Chidi Okonkwo"
              placeholderTextColor="#6b7280"
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="chidi.okonkwo@university.edu.ng"
              placeholderTextColor="#6b7280"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
            <Text style={styles.helperText}>Use your university email</Text>
          </View>

          {/* Username with Availability Indicator */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <View style={styles.relative}>
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="@chidi_o"
                placeholderTextColor="#6b7280"
                autoCapitalize="none"
                style={[
                  styles.input,
                  usernameAvailable === false && styles.inputError,
                ]}
              />
              <View style={styles.iconRight}>
                {isCheckingUsername ? (
                  <ActivityIndicator size="small" color="#6366f1" />
                ) : usernameAvailable === true ? (
                  <CheckCircle2 size={20} color="#10b981" />
                ) : usernameAvailable === false ? (
                  <XCircle size={20} color="#ef4444" />
                ) : null}
              </View>
            </View>
          </View>

          <View style={styles.inputGroupLarge}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.relative}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#6b7280"
                secureTextEntry={!showPassword}
                style={[styles.input, styles.passwordInput]}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.iconRight}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#9ca3af" />
                ) : (
                  <Eye size={20} color="#9ca3af" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleContinue}
            activeOpacity={0.8}
            disabled={loading}
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Continue</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => router.push("/authscreen/signin/Signin")}
            >
              <Text style={styles.linkTextSemibold}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "black" },
  flex1: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  backButton: { padding: 8, marginLeft: -8 },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "600",
    color: "white",
    marginRight: 40,
  },
  scrollContent: { paddingHorizontal: 24, paddingVertical: 24 },
  inputGroup: { marginBottom: 20 },
  inputGroupLarge: { marginBottom: 32 },
  label: { color: "white", fontSize: 14, marginBottom: 8 },
  input: {
    width: "100%",
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: "white",
  },
  inputError: { borderColor: "#ef4444" },
  relative: { justifyContent: "center", position: "relative" },
  iconRight: { position: "absolute", right: 16 },
  passwordInput: { paddingRight: 48 },
  helperText: { color: "#9ca3af", fontSize: 12, marginTop: 8 },
  primaryButton: {
    width: "100%",
    backgroundColor: "#6366f1",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 18 },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 24 },
  footerText: { color: "#9ca3af", fontSize: 14 },
  linkTextSemibold: { color: "#6366f1", fontSize: 14, fontWeight: "600" },
});
