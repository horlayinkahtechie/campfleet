import { OnboardingLayout } from "@/components/OnBoardingLayout";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
const INTERESTS = [
  "Tech & Innovation",
  "Music & Arts",
  "Photography",
  "Gaming",
  "Sports & Fitness",
  "Travel",

  "Programming & Coding",
  "Artificial Intelligence",
  "Web Development",
  "Mobile Apps",
  "UI/UX Design",
  "Cybersecurity",

  "Entrepreneurship",
  "Startups",
  "Business & Finance",
  "Investing",
  "Crypto & Blockchain",

  "Content Creation",
  "Social Media",
  "Blogging",
  "YouTube",
  "Podcasting",

  "Fashion & Style",
  "Beauty & Skincare",
  "Food & Cooking",
  "Health & Wellness",

  "Movies & TV Shows",
  "Anime & Manga",
  "Books & Reading",

  "Education & Learning",
  "Self Development",
  "Motivation",

  "Politics",
  "News & Current Affairs",

  "Cars & Automobiles",
  "Real Estate",
  "Interior Design",

  "Nature & Environment",
  "Volunteering & Charity",
  "Religion & Spirituality",
];

export default function Interest() {
  const [selected, setSelected] = useState([]);
  const router = useRouter();

  const toggleInterest = (val) => {
    if (selected.includes(val)) setSelected(selected.filter((i) => i !== val));
    else setSelected([...selected, val]);
  };

  const handleContinue = async () => {
    await AsyncStorage.setItem(
      "onboarding_interests",
      JSON.stringify(selected),
    );
    router.push("/onBoarding/ProfilePicture");
  };

  return (
    <OnboardingLayout
      step={3}
      title="Choose Your Interests"
      subtitle="Select at least 3 interests"
      onContinue={handleContinue}
      continueDisabled={selected.length < 3}
    >
      <View style={styles.grid}>
        {INTERESTS.map((interest) => {
          const isActive = selected.includes(interest);
          return (
            <TouchableOpacity
              key={interest}
              onPress={() => toggleInterest(interest)}
              style={[styles.chip, isActive && styles.chipActive]}
            >
              <Text
                style={[styles.chipText, isActive && styles.chipTextActive]}
              >
                {interest}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={styles.countText}>{selected.length} selected</Text>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 12,
    justifyContent: "center",
  },
  chip: {
    backgroundColor: "#111",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    margin: 6,
    borderSize: 1,
    borderColor: "#1f1f1f",
  },
  chipActive: { borderColor: "#6366f1", borderWidth: 1 },
  chipText: { color: "#fff" },
  chipTextActive: { color: "#6366f1", fontWeight: "bold" },
  countText: { color: "#9ca3af", textAlign: "center", marginTop: 20 },
});
