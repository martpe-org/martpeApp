 import React, { useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { fetchTicketsList } from '@/components/ticket/api/fetchTicketsList';
import { TicketList } from '@/components/ticket/TicketList';
import useUserDetails from '@/hook/useUserDetails';

export default function TicketsIndexScreen() {  
  const { 
    authToken, 
    isAuthenticated, 
    isLoading: isUserLoading 
  } = useUserDetails();

  const {
    data: ticketsData,
    isLoading: isQueryLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['tickets-list'],
    queryFn: () => fetchTicketsList(authToken!),
    enabled: !!authToken && isAuthenticated,
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (error) {
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

  if (isUserLoading || isQueryLoading) {
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
        refreshing={isQueryLoading}
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