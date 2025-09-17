import { Slot } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Platform } from "react-native";
import { ToastProvider } from "react-native-toast-notifications";
import { setStatusBarBackgroundColor } from "expo-status-bar";

export default function Layout() {
  // On Android, set status bar background explicitly
  if (Platform.OS === "android") {
    setStatusBarBackgroundColor("#ffffff", true); // white background
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <ToastProvider
          placement="bottom"
          duration={3000}
          animationType="slide-in"
          offsetBottom={60}
        >
          <Slot />
          <StatusBar style="dark" hidden={false}/>
        </ToastProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff", // white background for Android nav bar
  },
});
