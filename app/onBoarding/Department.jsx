import { OnboardingLayout } from "@/components/OnBoardingLayout";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Check, Search } from "lucide-react-native";
import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const DEPARTMENTS = [
  "Computer Science",
  "Information System Science",
  "Information Technology",
  "Software Engineering",
  "Cybersecurity",

  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Petroleum Engineering",
  "Mechatronics Engineering",
  "Agricultural Engineering",

  "Economics",
  "Accounting",
  "Business Administration",
  "Banking & Finance",
  "Marketing",
  "Entrepreneurship",
  "Public Administration",

  "Mass Communication",
  "Journalism",
  "Media & Communication Studies",
  "International Relations",
  "Political Science",

  "Law",

  "Medicine & Surgery",
  "Nursing",
  "Pharmacy",
  "Public Health",
  "Anatomy",
  "Physiology",
  "Medical Laboratory Science",

  "Biochemistry",
  "Microbiology",
  "Industrial Chemistry",
  "Physics",
  "Mathematics",
  "Statistics",

  "Architecture",
  "Estate Management",
  "Urban & Regional Planning",
  "Quantity Surveying",

  "Psychology",
  "Sociology",
  "Criminology & Security Studies",
  "Social Work",

  "Education",
  "Educational Management",
  "Guidance & Counselling",

  "Agriculture",
  "Crop Science",
  "Animal Science",
  "Fisheries & Aquaculture",
  "Forestry & Wildlife",

  "English & Literary Studies",
  "Linguistics",
  "History & International Studies",
  "Philosophy",
  "Religious Studies",
];

export default function Department() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const router = useRouter();

  const filtered = DEPARTMENTS.filter((d) =>
    d.toLowerCase().includes(query.toLowerCase()),
  );

  const handleContinue = async () => {
    await AsyncStorage.setItem("onboarding_department", selected);
    router.push("/onBoarding/Interest");
  };

  return (
    <OnboardingLayout
      step={2}
      title="Your Department"
      subtitle="What are you studying?"
      onContinue={handleContinue}
      continueDisabled={!selected}
      scrollable={false} // ✅ IMPORTANT FIX
    >
      {/* 🔍 Search */}
      <View style={styles.searchBox}>
        <Search size={20} color="#6b7280" />
        <TextInput
          placeholder="Search departments..."
          placeholderTextColor="#6b7280"
          style={styles.input}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {/* 📋 List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }} // ✅ prevents footer overlap
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.item, selected === item && styles.selectedItem]}
            onPress={() => setSelected(item)}
          >
            <Text style={styles.itemText}>{item}</Text>

            {selected === item && <Check size={20} color="#6366f1" />}
          </TouchableOpacity>
        )}
      />
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    margin: 24,
    paddingHorizontal: 16,
    borderRadius: 12,
    height: 50,
  },
  input: { flex: 1, color: "#fff", marginLeft: 10, fontSize: 16 },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#111",
  },
  itemText: { color: "#fff", fontSize: 16 },
});
