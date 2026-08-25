import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StyleSheet, View } from "react-native";
import FlashMessage from "react-native-flash-message";

export default function RootLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <View style={styles.container}>
        {/* <StatusBar style="light" /> */}
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#000" },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="welcomeScreen/Welcome" />
          <Stack.Screen name="authscreen/signin/Signin" />
          <Stack.Screen name="authscreen/signup/Signup" />
          <Stack.Screen name="authscreen/verifyemail/VerifyEmail" />
          <Stack.Screen name="onBoarding/Department" />
          <Stack.Screen name="onBoarding/Institution" />
          <Stack.Screen name="onBoarding/Interest" />
          <Stack.Screen name="onBoarding/Follow" />
          <Stack.Screen name="onBoarding/ProfilePicture" />
          <Stack.Screen name="(tabs)" />
        </Stack>

        <FlashMessage position="top" />
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
});
