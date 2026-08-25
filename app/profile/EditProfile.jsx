import { auth, db } from "@/lib/firebase";
import { useRouter } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Check, ChevronLeft, Search } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
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

export default function EditProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Form States
  const [bio, setBio] = useState("");
  const [institution, setInstitution] = useState("");
  const [department, setDepartment] = useState("");

  // Modal States
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null); // 'uni' or 'dept'
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setBio(data.bio || "");
          setInstitution(data.institution || "");
          setDepartment(data.department || "");
        }
      } catch (error) {
        Alert.alert("Error", "Could not load data");
      } finally {
        setLoading(false);
      }
    };
    loadUserData();
  }, []);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        bio: bio.trim(),
        institution,
        department,
      });
      router.back();
    } catch (error) {
      Alert.alert("Error", "Update failed.");
    } finally {
      setUpdating(false);
    }
  };

  // Filter lists based on search
  const filteredData =
    modalType === "uni"
      ? NIGERIAN_UNIVERSITIES.filter((u) =>
          u.name.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : DEPARTMENTS.filter((d) =>
          d.toLowerCase().includes(searchQuery.toLowerCase()),
        );

  const openPicker = (type) => {
    setModalType(type);
    setSearchQuery("");
    setModalVisible(true);
  };

  const selectItem = (item) => {
    if (modalType === "uni") setInstitution(item);
    else setDepartment(item);
    setModalVisible(false);
  };

  if (loading)
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color="#6366f1" size="large" />
      </View>
    );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft color="white" size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.form}>
          {/* Institution Selector */}
          <Text style={styles.label}>Institution</Text>
          <TouchableOpacity
            style={styles.pickerTrigger}
            onPress={() => openPicker("uni")}
          >
            <Text
              style={[styles.pickerText, !institution && { color: "#4b5563" }]}
            >
              {institution || "Select University"}
            </Text>
          </TouchableOpacity>

          {/* Department Selector */}
          <Text style={styles.label}>Department</Text>
          <TouchableOpacity
            style={styles.pickerTrigger}
            onPress={() => openPicker("dept")}
          >
            <Text
              style={[styles.pickerText, !department && { color: "#4b5563" }]}
            >
              {department || "Select Department"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself..."
            placeholderTextColor="#4b5563"
            multiline
          />

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleUpdate}
            disabled={updating}
          >
            {updating ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.saveBtnText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* SEARCH MODAL */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {modalType === "uni" ? "Select University" : "Select Department"}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ color: "#6366f1", fontWeight: "bold" }}>Done</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchBar}>
            <Search size={20} color="#9ca3af" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <FlatList
            data={filteredData}
            keyExtractor={(item) => (typeof item === "string" ? item : item.id)}
            renderItem={({ item }) => {
              const label = typeof item === "string" ? item : item.name;
              const isSelected =
                label === (modalType === "uni" ? institution : department);
              return (
                <TouchableOpacity
                  style={styles.listItem}
                  onPress={() => selectItem(label)}
                >
                  <Text
                    style={[
                      styles.listItemText,
                      isSelected && { color: "#6366f1" },
                    ]}
                  >
                    {label}
                  </Text>
                  {isSelected && <Check size={18} color="#6366f1" />}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  center: { justifyContent: "center", alignItems: "center" },
  scrollContent: { paddingBottom: 40 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "bold" },
  form: { paddingHorizontal: 20, marginTop: 20 },
  label: { color: "#9ca3af", fontSize: 14, marginBottom: 8, fontWeight: "600" },
  pickerTrigger: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#333",
  },
  pickerText: { color: "white", fontSize: 16 },
  input: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    color: "white",
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#333",
  },
  textArea: { height: 120, textAlignVertical: "top" },
  saveBtn: {
    backgroundColor: "#6366f1",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  saveBtnText: { color: "white", fontSize: 16, fontWeight: "bold" },
  // Modal Styles
  modalContainer: { flex: 1, backgroundColor: "#111", paddingTop: 20 },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  modalTitle: { color: "white", fontSize: 18, fontWeight: "bold" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222",
    margin: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    height: 45,
  },
  searchInput: { flex: 1, color: "white", marginLeft: 10 },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  listItemText: { color: "#ccc", fontSize: 16 },
});
