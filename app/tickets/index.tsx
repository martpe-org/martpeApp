import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchTicketsList } from '@/components/ticket/api/fetchTicketsList';
import { TicketList } from '@/components/ticket/TicketList';


export default function TicketsIndexScreen() {
  const router = useRouter();
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Check authentication token
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('auth-token');
        if (!token) {
          return;
        }
        setAuthToken(token);
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsAuthLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Fetch tickets data
  const {
    data: ticketsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['tickets-list'],
    queryFn: () => fetchTicketsList(authToken!),
    enabled: !!authToken,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle query error
  useEffect(() => {
    if (error) {
      console.error('Tickets fetch error:', error);
      Alert.alert(
        'Error',
        'Failed to load complaints. Please try again.',
        [
          { text: 'Retry', onPress: () => refetch() },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  }, [error, refetch]);

  // Show loading spinner during auth check
  if (isAuthLoading || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TicketList
        ticketsData={ticketsData || null}
        onRefresh={refetch}
        refreshing={isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
