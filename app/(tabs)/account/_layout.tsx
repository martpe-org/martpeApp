import { Stack } from "expo-router";
import { ToastProvider } from "react-native-toast-notifications";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function AccountLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ToastProvider
        placement="top"
        duration={3000}
        animationType="slide-in"
        animationDuration={200}
        successColor="green"
        dangerColor="red"
        warningColor="orange"
        normalColor="#333"
        swipeEnabled={true}
      >
        <Stack screenOptions={{ headerShown: false }}>
          {/* Default Account screen */}
          <Stack.Screen name="index" />

          {/* Wishlist screen inside Account */}
          <Stack.Screen name="wishlist" />
        </Stack>
      </ToastProvider>
    </GestureHandlerRootView>
  );
}
