import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Search } from "lucide-react-native";
import React, { useState } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const NIGERIAN_UNIVERSITIES = [
  { id: "1", name: "University of Lagos (UNILAG)" },
  { id: "2", name: "University of Ibadan (UI)" },
  { id: "3", name: "Obafemi Awolowo University (OAU)" },
  { id: "4", name: "Ahmadu Bello University (ABU)" },
  { id: "5", name: "University of Nigeria, Nsukka (UNN)" },
  { id: "6", name: "Covenant University" },
  { id: "7", name: "Lagos State University (LASU)" },
  { id: "8", name: "Federal University of Technology, Akure (FUTA)" },
  { id: "9", name: "University of Benin (UNIBEN)" },
  { id: "10", name: "Babcock University" },

  { id: "11", name: "Bayero University Kano (BUK)" },
  { id: "12", name: "Ladoke Akintola University of Technology (LAUTECH)" },
  { id: "13", name: "Nnamdi Azikiwe University (UNIZIK)" },
  { id: "14", name: "University of Ilorin (UNILORIN)" },
  { id: "15", name: "Federal University of Technology, Owerri (FUTO)" },
  { id: "16", name: "University of Port Harcourt (UNIPORT)" },
  { id: "17", name: "Ekiti State University (EKSU)" },
  { id: "18", name: "Delta State University, Abraka (DELSU)" },
  { id: "19", name: "Adekunle Ajasin University (AAUA)" },
  { id: "20", name: "Federal University Oye-Ekiti (FUOYE)" },

  { id: "21", name: "University of Abuja (UNIABUJA)" },
  { id: "22", name: "Usmanu Danfodiyo University, Sokoto (UDUS)" },
  { id: "23", name: "Federal University of Agriculture, Abeokuta (FUNAAB)" },
  { id: "24", name: "Michael Okpara University of Agriculture (MOUAU)" },
  { id: "25", name: "Abia State University (ABSU)" },
  { id: "26", name: "Imo State University (IMSU)" },
  { id: "27", name: "Benue State University (BSU)" },
  { id: "28", name: "Niger Delta University (NDU)" },
  { id: "29", name: "Ambrose Alli University (AAU)" },
  { id: "30", name: "Kwara State University (KWASU)" },

  { id: "31", name: "Osun State University (UNIOSUN)" },
  { id: "32", name: "Olabisi Onabanjo University (OOU)" },
  { id: "33", name: "Rivers State University (RSU)" },
  { id: "34", name: "Kaduna State University (KASU)" },
  { id: "35", name: "Plateau State University (PLASU)" },
  { id: "36", name: "Gombe State University (GSU)" },
  { id: "37", name: "Taraba State University (TSU)" },
  { id: "38", name: "Kogi State University (KSU)" },
  { id: "39", name: "Cross River University of Technology (CRUTECH)" },
  { id: "40", name: "Enugu State University of Science and Technology (ESUT)" },

  { id: "41", name: "Afe Babalola University (ABUAD)" },
  { id: "42", name: "Bowen University" },
  { id: "43", name: "Redeemer's University" },
  { id: "44", name: "Joseph Ayo Babalola University (JABU)" },
  { id: "45", name: "Lead City University" },
  { id: "46", name: "Madonna University Nigeria" },
  { id: "47", name: "American University of Nigeria (AUN)" },
  { id: "48", name: "Pan-Atlantic University" },
  { id: "49", name: "Nile University of Nigeria" },
  { id: "50", name: "Veritas University Abuja" },
];

export default function Institution() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  // Filter logic
  const filteredData = NIGERIAN_UNIVERSITIES.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleContinue = async () => {
    const selectedName = NIGERIAN_UNIVERSITIES.find(
      (i) => i.id === selectedId,
    ).name;
    await AsyncStorage.setItem("onboarding_institution", selectedName);
    router.push("/onBoarding/Department");
  };

  const renderItem = ({ item }) => {
    const isSelected = selectedId === item.id;
    return (
      <TouchableOpacity
        style={[styles.listItem, isSelected && styles.selectedItem]}
        onPress={() => setSelectedId(item.id)}
        activeOpacity={0.7}
      >
        <Text style={[styles.itemText, isSelected && styles.selectedItemText]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Step Indicator & Header */}
      <View style={styles.header}>
        <View style={styles.stepContainer}>
          <Text style={styles.stepText}>Step 1 of 5</Text>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
        </View>
        <Text style={styles.title}>Select Your Institution</Text>
        <Text style={styles.subtitle}>
          Let&apos;s start by finding your school
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <Search size={20} color="#6b7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search institutions..."
          placeholderTextColor="#6b7280"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* List */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={true}
        indicatorStyle="white"
      />

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, !selectedId && styles.disabledButton]}
          onPress={handleContinue}
          disabled={!selectedId}
        >
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingTop: 30,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 20,
  },
  stepContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  stepText: {
    color: "#9ca3af",
    fontSize: 14,
  },
  progressBar: {
    height: 4,
    width: 100,
    backgroundColor: "#1f1f1f",
    borderRadius: 2,
  },
  progressFill: {
    height: "100%",
    width: "20%", // Step 1 of 5
    backgroundColor: "#6366f1",
    borderRadius: 2,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    color: "#9ca3af",
    fontSize: 16,
  },
  searchSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1f1f1f",
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    color: "#fff",
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 20,
  },
  listItem: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#111",
  },
  selectedItem: {
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  itemText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  selectedItemText: {
    color: "#6366f1",
  },
  footer: {
    padding: 20,
    backgroundColor: "#000",
    borderTopWidth: 1,
    borderTopColor: "#111",
  },
  continueButton: {
    backgroundColor: "#6366f1",
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#312e81",
    opacity: 0.6,
  },
  continueText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
