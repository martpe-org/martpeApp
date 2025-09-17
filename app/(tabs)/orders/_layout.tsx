import { Slot } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import CartProvider from "@/hook/CartProvider";
import UserProvider from "@/state/UserProvider"; // 👈 import it

export default function Layout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <UserProvider
          firstName="Guest"
          phoneNumber=""
          email=""
          isAuthenticated={false}
          userId=""
          favoriteItems={[]}
          favoriteStores={[]}
          location={{
            addressId: "",
            lat: 0,
            lng: 0,
            city: "",
            pincode: "",
          }}
        >
          <CartProvider>
            <Slot />
          </CartProvider>
        </UserProvider>
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
