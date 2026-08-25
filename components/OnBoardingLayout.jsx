import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export const OnboardingLayout = ({
  step,
  title,
  subtitle,
  children,
  onContinue,
  continueDisabled,
  onSkip, // ✅ FIXED
  scrollable = true, // ✅ NEW
}) => (
  <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === "ios" ? "padding" : undefined}
  >
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.progressRow}>
          <Text style={styles.stepText}>Step {step} of 5</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${step * 20}%` }]} />
          </View>
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      {/* CONTENT */}
      {scrollable ? (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={styles.content}>{children}</View>
      )}

      {/* FOOTER */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.btn, continueDisabled && styles.btnDisabled]}
          onPress={onContinue}
          disabled={continueDisabled}
        >
          <Text style={styles.btnText}>Continue</Text>
        </TouchableOpacity>

        {onSkip && (
          <TouchableOpacity style={styles.skipBtn} onPress={onSkip}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  </KeyboardAvoidingView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", paddingTop: 60 },

  header: { paddingHorizontal: 24, marginBottom: 10 },

  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  stepText: { color: "#9ca3af", fontSize: 14 },

  progressTrack: {
    height: 4,
    width: 100,
    backgroundColor: "#1f1f1f",
    borderRadius: 2,
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#6366f1",
    borderRadius: 2,
  },

  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 4,
  },

  subtitle: { color: "#9ca3af", fontSize: 16 },

  content: { flex: 1 },

  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120, // ✅ prevents footer overlap
    flexGrow: 1,
  },

  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "#111",
    backgroundColor: "#000",
  },

  btn: {
    backgroundColor: "#6366f1",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
  },

  btnDisabled: { backgroundColor: "#312e81", opacity: 0.5 },

  btnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },

  skipBtn: { marginTop: 16, alignItems: "center" },

  skipText: { color: "#9ca3af", fontSize: 14 },
});
