import { Slot } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import CartProvider from "@/hook/CartProvider"; // adjust import path

export default function Layout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <CartProvider>
          <Slot />
        </CartProvider>
        <StatusBar style="dark" hidden={false} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
