import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Briefcase, GraduationCap, Target, Users } from "lucide-react-native";
import React from "react";
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();

  const features = [
    { icon: <Users size={28} color="#6366f1" />, label: "Connect" },
    { icon: <Briefcase size={28} color="#6366f1" />, label: "Earn" },
    { icon: <Target size={28} color="#6366f1" />, label: "Study" },
    { icon: <Users size={28} color="#6366f1" />, label: "Grow" },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Section: Logo & Branding */}
        <View style={styles.header}>
          <LinearGradient
            colors={["#818cf8", "#6366f1"]}
            style={styles.logoGradient}
          >
            <GraduationCap size={50} color="white" strokeWidth={1.5} />
          </LinearGradient>

          <Text style={styles.title}>Campfleet</Text>
          <Text style={styles.subtitle}>
            Your all-in-one campus social network for Nigerian students
          </Text>
        </View>

        {/* Middle Section: Features Grid */}
        <View style={styles.grid}>
          {features.map((item, index) => (
            <View key={index} style={styles.card}>
              <View style={styles.iconWrapper}>{item.icon}</View>
              <Text style={styles.cardLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Bottom Section: Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={() => router.push("/authscreen/signup/Signup")}
            activeOpacity={0.8}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/authscreen/signin/Signin")}
            activeOpacity={0.7}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000000",
  },
  container: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: "space-between",
    paddingVertical: 50,
  },
  header: {
    alignItems: "center",
    marginTop: 20,
  },
  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 26,
    paddingHorizontal: 10,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    backgroundColor: "#121212",
    borderWidth: 1,
    borderColor: "#1f1f1f",
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
  },
  iconWrapper: {
    marginBottom: 12,
  },
  cardLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    width: "100%",
  },
  primaryButton: {
    backgroundColor: "#6366f1",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  secondaryButton: {
    backgroundColor: "#121212",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1f1f1f",
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
