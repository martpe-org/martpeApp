import { Slot } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { ToastProvider } from "react-native-toast-notifications"; // ✅ Import this

export default function Layout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <ToastProvider // ✅ Wrap Slot inside ToastProvider
          placement="bottom"
          duration={3000}
          animationType="slide-in"
          offsetBottom={60}
        >
          <Slot />
          <StatusBar style="dark" hidden={false} />
        </ToastProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
