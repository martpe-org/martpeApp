import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function AccountLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SavedAddresses" />
        <Stack.Screen name="AddNewAddress" />
        <Stack.Screen name="[EditAddress]" />
      </Stack>
    </GestureHandlerRootView>
  );
}
