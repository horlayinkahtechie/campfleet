import { OnboardingLayout } from "@/components/OnBoardingLayout";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Camera, User } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfilePictureScreen() {
  const router = useRouter();
  const [image, setImage] = useState(null);

  // OPTIMIZATION LOGIC
  const processImage = async (uri) => {
    try {
      const actions = [
        { resize: { width: 400, height: 400 } }, // Standardized size
      ];
      const saveOptions = {
        compress: 0.7, // 70% quality (best balance)
        format: ImageManipulator.SaveFormat.JPEG,
      };

      const result = await ImageManipulator.manipulateAsync(
        uri,
        actions,
        saveOptions,
      );

      // Save optimized URI to state and local storage
      setImage(result.uri);
      await AsyncStorage.setItem("onboarding_photo", result.uri);
    } catch (error) {
      Alert.alert("Error", "Failed to process image.");
    }
  };

  const pickImage = async (useCamera = false) => {
    let result;

    if (useCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") return Alert.alert("Permission denied");
      result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1, // Start with high quality, optimize after
      });
    }

    if (!result.canceled) {
      await processImage(result.assets[0].uri);
    }
  };

  return (
    <OnboardingLayout
      step={4}
      title="Add Profile Picture"
      subtitle="Help others recognize you"
      onContinue={() => router.push("/onBoarding/Follow")}
      skipText={() => router.push("/(tabs)/home")}
    >
      <View style={styles.centerContainer}>
        <View style={styles.avatarContainer}>
          <TouchableOpacity
            style={styles.avatarCircle}
            onPress={() => pickImage(false)}
            activeOpacity={0.8}
          >
            {image ? (
              <Image source={{ uri: image }} style={styles.image} />
            ) : (
              <User size={80} color="#4b5563" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cameraBadge}
            onPress={() => pickImage(true)}
            activeOpacity={0.8}
          >
            <Camera size={20} color="white" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.uploadBtn}
          onPress={() => pickImage(false)}
        >
          <Text style={styles.uploadText}>Upload from gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.photoBtn}
          onPress={() => pickImage(true)}
        >
          <Text style={styles.photoText}>Take a photo</Text>
        </TouchableOpacity>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  centerContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  avatarContainer: { position: "relative", marginBottom: 40 },
  avatarCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    overflow: "hidden",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#6366f1",
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#000",
    zIndex: 2,
  },
  image: { width: 160, height: 160 },
  uploadBtn: { marginBottom: 12 },
  uploadText: { color: "#6366f1", fontSize: 16, fontWeight: "600" },
  photoBtn: { marginTop: 8 },
  photoText: { color: "#fff", fontSize: 14, fontWeight: "500" },
});
