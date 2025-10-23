import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TicketLayout() {
  const router = useRouter();

  const renderBackButton = () => (
    <TouchableOpacity onPress={() => router.push("/(tabs)/account")} style={{ marginLeft:-9, marginRight:15}}>
      <Ionicons name="arrow-back-outline" size={26} color="#010102" />
    </TouchableOpacity>
  );

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#f5f5f5' },
        headerTintColor: 'black',
        headerBackVisible: false, // hide default back button
        headerLeft: renderBackButton, // add custom back button
      }}
    >
      <Stack.Screen name="index" options={{ title: 'My Complaints' }} />
      <Stack.Screen name="[ticketId]" options={{ title: 'Complaint Details' }} />
    </Stack>
  );
}
