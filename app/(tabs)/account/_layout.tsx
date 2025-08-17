// app/(tabs)/account/_layout.tsx
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";


export default function AccountLayout() {
  return (
        <GestureHandlerRootView style={{ flex: 1 }}>

    <Stack screenOptions={{ headerShown: false }}>
      {/* Default Account screen */}
      <Stack.Screen name="index" />

      {/* Wishlist screen inside Account */}
      <Stack.Screen name="wishlist" />
    </Stack>
        </GestureHandlerRootView>

  );
}
