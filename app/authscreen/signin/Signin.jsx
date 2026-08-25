import { auth, db } from "@/lib/firebase"; // Import your config
import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { ArrowLeft, Eye, EyeOff } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

export default function Signin() {
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!identifier || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    let loginEmail = identifier.trim();

    try {
      if (!loginEmail.includes("@")) {
        const cleanUsername = loginEmail.replace("@", "").toLowerCase();
        const q = query(
          collection(db, "users"),
          where("username", "==", cleanUsername),
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          throw new Error("Username not found");
        }
        loginEmail = querySnapshot.docs[0].data().email;
      }

      const userCredential = await signInWithEmailAndPassword(
        auth,
        loginEmail,
        password,
      );
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();

        if (!user.emailVerified) {
          router.replace("/authscreen/verifyemail/VerifyEmail");
        } else if (!userData.onboarding_completed) {
          router.replace("/onBoarding/Institution");
        } else {
          router.replace("/(tabs)/home");
        }
      } else {
        router.replace("/onBoarding/Institution");
      }
    } catch (error) {
      let errorMessage = "Invalid email or password";
      if (error.message === "Username not found")
        errorMessage = "Username not found";

      Alert.alert("Login Failed", errorMessage);
      console.log(error.code);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex1}
      >
        <ScrollView contentContainerStyle={styles.scrollGrow}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Sign In</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email or Username</Text>
              <TextInput
                value={identifier}
                onChangeText={setIdentifier}
                placeholder="chidi_o or chidi@uni.edu"
                placeholderTextColor="#6b7280"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordWrapper}>
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
                  style={styles.eyeIcon}
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
              onPress={() =>
                router.push("/authscreen/forgotpassword/ForgotPassword")
              }
              style={styles.forgotPassword}
            >
              <Text style={styles.linkText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSignIn}
              activeOpacity={0.8}
              style={[styles.primaryButton, loading && { opacity: 0.7 }]}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Don&apos;t have an account?{" "}
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/authscreen/signup/Signup")}
              >
                <Text style={styles.linkTextSemibold}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
// ... styles remain the same as your provided code

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "black" },
  flex1: { flex: 1 },
  scrollGrow: { flexGrow: 1 },
  header: {
    flexDirection: "row",
    itemsCenter: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
    alignItems: "center",
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
  formContainer: { flex: 1, justifyContent: "center", padding: 24 },
  inputGroup: { marginBottom: 24 },
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
  passwordWrapper: { justifyContent: "center", position: "relative" },
  passwordInput: { paddingRight: 48 },
  eyeIcon: { position: "absolute", right: 16 },
  forgotPassword: { alignItems: "flex-end", marginBottom: 24 },
  linkText: { color: "#6366f1", fontSize: 14 },
  linkTextSemibold: { color: "#6366f1", fontSize: 14, fontWeight: "600" },
  primaryButton: {
    width: "100%",
    backgroundColor: "#6366f1",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 18 },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 24 },
  footerText: { color: "#9ca3af", fontSize: 14 },
});
