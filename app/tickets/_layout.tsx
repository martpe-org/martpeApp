import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TicketLayout() {
  const router = useRouter();

  const renderBackButton = () => (
    <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 10 }}>
      <Ionicons name="arrow-back-outline" size={24} color="#010102" />
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
