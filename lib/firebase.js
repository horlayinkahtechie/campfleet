import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBLV2K94xDfp2vZU6t67hGOWRstRuGMKR8",
  authDomain: "campfleet-6ebd7.firebaseapp.com",
  projectId: "campfleet-6ebd7",
  storageBucket: "campfleet-media",
  messagingSenderId: "118709599449",
  appId: "1:118709599449:web:691bd04999dd177ab0d2c8",
  measurementId: "G-GR5DK5W8BP",
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export const db = getFirestore(app);
export const storage = getStorage(app);
