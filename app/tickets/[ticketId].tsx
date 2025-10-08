import React, { useEffect, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Alert, 
  ActivityIndicator, 
  Text, 
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { fetchTicketDetail } from '@/components/ticket/api/fetch-ticket-detail';
import { TicketDetail } from '@/components/ticket/TicketDetail';
import useUserDetails from '@/hook/useUserDetails';


export default function TicketDetailScreen() {
  console.log('🚀 TicketDetailScreen mounted');
  
  const router = useRouter();
  const { ticketId } = useLocalSearchParams<{ ticketId: string }>();
  
  // Use your userDetails hook instead of manual AsyncStorage check
  const { 
    userDetails, 
    authToken, 
    isAuthenticated, 
    isLoading: isUserLoading 
  } = useUserDetails();

  console.log('📋 Params received:', { ticketId });
  console.log('🔐 Auth state:', { 
    isAuthenticated, 
    hasUserDetails: !!userDetails,
    hasAuthToken: !!authToken,
    isUserLoading 
  });

  const {
    data: ticketData,
    isLoading: isQueryLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['ticket-detail', ticketId],
    queryFn: () => {
      console.log('🔄 QueryFn called with:', { 
        authToken: authToken ? 'present' : 'null', 
        ticketId,
        isAuthenticated 
      });
      
      if (!authToken || !ticketId || !isAuthenticated) {
        console.log('⏭️ Skipping query - missing authToken, ticketId, or not authenticated');
        return Promise.resolve(null);
      }
      
      console.log('📡 Calling fetchTicketDetail...');
      return fetchTicketDetail(authToken, ticketId);
    },
    enabled: !!authToken && !!ticketId && isAuthenticated,
    retry: 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
    onSuccess: (data) => {
      console.log('✅ Query success:', data ? 'Data received' : 'No data');
    },
    onError: (error) => {
      console.error('❌ Query error:', error);
    },
  });

  console.log('📊 Current state:', {
    isUserLoading,
    isQueryLoading,
    isAuthenticated,
    hasTicketData: !!ticketData,
    hasError: !!error,
  });

  // Handle authentication failure
  useEffect(() => {
    if (!isUserLoading && !isAuthenticated) {
      console.log('🔐 User not authenticated, showing alert');
      Alert.alert(
        'Authentication Required',
        'Please login to view complaint details.',
        [
          { 
            text: 'Login', 
          },
          { 
            text: 'Go Back', 
            onPress: () => router.back(),
            style: 'cancel'
          }
        ]
      );
    }
  }, [isUserLoading, isAuthenticated, router]);

  // Handle query error
  useEffect(() => {
    if (error) {
      console.error('💥 Ticket detail fetch error in useEffect:', error);
      Alert.alert(
        'Error',
        'Failed to load complaint details. Please try again.',
        [
          { text: 'Retry', onPress: () => {
            console.log('🔄 User pressed retry');
            refetch();
          }},
          { text: 'Go Back', onPress: () => {
            console.log('🔙 User pressed go back');
            router.back();
          }, style: 'cancel' }
        ]
      );
    }
  }, [error, refetch, router]);

  // Show loading spinner during user details fetch or data fetch
  if (isUserLoading || isQueryLoading) {
    console.log('⏳ Showing loading state');
    
    return (
      <>
        <Stack.Screen 
          options={{
            title: 'Complaint Details',
            headerBackTitle: 'Back',
          }} 
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading complaint details...</Text>
        </View>
      </>
    );
  }

  // Show authentication error
  if (!isAuthenticated) {
    console.log('🔐 Showing authentication error state');
    
    return (
      <>
        <Stack.Screen 
          options={{
            title: 'Authentication Required',
            headerBackTitle: 'Back',
          }} 
        />
        <ScrollView contentContainerStyle={styles.errorContainer}>
          <Ionicons name="lock-closed-outline" size={64} color="#ff6b35" />
          <Text style={styles.errorTitle}>Authentication Required</Text>
          <Text style={styles.errorMessage}>
            Please log in to view complaint details.
          </Text>
          
          <View style={styles.errorActions}>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                console.log('🔐 Login button pressed');
              }}
            >
              <Text style={styles.retryButtonText}>Login</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.backButtonStyle}
              onPress={() => {
                console.log('🔙 Go Back button pressed');
                router.back();
              }}
            >
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </>
    );
  }

  // Show error state if no data
  if (!ticketData) {
    console.log('🚫 Showing error state - no ticket data');
    
    return (
      <>
        <Stack.Screen 
          options={{
            title: 'Complaint Not Found',
            headerBackTitle: 'Back',
          }} 
        />
        <ScrollView contentContainerStyle={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ff6b35" />
          <Text style={styles.errorTitle}>Complaint Not Found</Text>
          <Text style={styles.errorMessage}>
            Unable to load complaint details. The complaint may have been removed or you may not have access to it.
          </Text>
          
          <View style={styles.errorActions}>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                console.log('🔄 Try Again button pressed');
                refetch();
              }}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.backButtonStyle}
              onPress={() => {
                console.log('🔙 Go Back button pressed');
                router.back();
              }}
            >
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </>
    );
  }

  console.log('✅ Rendering TicketDetail component');

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Complaint Details',
          headerBackTitle: 'Complaints',
        }} 
      />
      <View style={styles.container}>
        <TicketDetail data={ticketData} />
      </View>
    </>
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 16,
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 16,
  },
  backButtonStyle: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 16,
  },
});
