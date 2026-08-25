import { auth, db } from "@/lib/firebase";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { GraduationCap } from "lucide-react-native";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const minimumDisplayTime = 1500;
      const start = Date.now();

      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const userData = userDoc.data();

          const end = Date.now();
          const waitTime = Math.max(0, minimumDisplayTime - (end - start));

          setTimeout(() => {
            if (!user.emailVerified) {
              router.replace("/authscreen/verifyemail/VerifyEmail");
            } else if (!userData?.onboarding_completed) {
              router.replace("/onBoarding/Institution");
            } else {
              router.replace("/(tabs)/home");
            }
          }, waitTime);
        } catch (error) {
          console.error("Splash Auth Error:", error);
          router.replace("/authscreen/signin/Signin");
        }
      } else {
        setTimeout(() => {
          router.replace("/welcomeScreen/Welcome");
        }, minimumDisplayTime);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <GraduationCap size={80} color="#6366f1" strokeWidth={1.5} />
      <View style={styles.loader}>
        <ActivityIndicator color="#6366f1" size="small" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  loader: {
    position: "absolute",
    bottom: 50,
  },
});
