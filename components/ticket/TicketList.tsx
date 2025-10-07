import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { FetchTicketsListItemType } from './api/fetch-ticket-list-type';

interface TicketListProps {
  ticketsData: FetchTicketsListItemType[] | null;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export const TicketList: React.FC<TicketListProps> = ({ 
  ticketsData, 
  onRefresh, 
  refreshing = false 
}) => {
  const router = useRouter();

  if (!ticketsData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load tickets</Text>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return '#ff6b35';
      case 'closed': return '#4caf50';
      case 'resolved': return '#2196f3';
      default: return '#757575';
    }
  };

  const renderTicket = ({ item }: { item: FetchTicketsListItemType }) => (
    <TouchableOpacity 
      style={styles.ticketCard}
      onPress={() => router.push(`../../(tabs)/tickets/${item._id}`)}
    >
      <View style={styles.ticketHeader}>
        <Text style={styles.ticketTitle}>
          {item.descriptor.short_desc}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <Text style={styles.ticketDescription} numberOfLines={2}>
        {item.descriptor.long_desc}
      </Text>
      
      <View style={styles.ticketInfo}>
        <Text style={styles.infoLabel}>Status</Text>
        <Text style={styles.infoValue}>{item.status}</Text>
      </View>
      
      <View style={styles.ticketInfo}>
        <Text style={styles.infoLabel}>Created on</Text>
        <Text style={styles.infoValue}>
          {new Date(item.created_at).toLocaleString()}
        </Text>
      </View>
      
      <View style={styles.storeInfo}>
        <Text style={styles.storeName}>{item.store.name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Complaints</Text>
      
      <FlatList
        data={ticketsData}
        renderItem={renderTicket}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        onRefresh={onRefresh}
        refreshing={refreshing}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No complaints found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    backgroundColor: '#fff',
  },
  listContainer: {
    padding: 16,
  },
  ticketCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  ticketDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  ticketInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 12,
    color: '#333',
  },
  storeInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  storeName: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ff0000',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
});
