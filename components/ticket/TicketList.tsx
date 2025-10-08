import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { FetchTicketsListItemType } from './api/fetch-ticket-list-type';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImageComp from '../common/ImageComp';

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

  const renderTicket = ({ item }: { item: FetchTicketsListItemType }) => (
    <TouchableOpacity
      style={styles.ticketCard}
      onPress={() => router.push(`../../tickets/${item._id}`)}
    >
      <View style={styles.storeHeader}>
        <ImageComp
          source={{ uri: item.store.symbol }}
          imageStyle={styles.storeLogo}
          resizeMode="contain"
        />
        <Text style={styles.storeName}>{item.store.name}</Text>
      </View>

      <View style={styles.divider} />

      <Text style={styles.ticketTitle}>
        {item.descriptor.short_desc}
      </Text>

      <Text style={styles.ticketDescription}>
        {item.descriptor.long_desc}
      </Text>

      <View style={styles.infoSection}>
        <Text style={styles.infoLabel}>Status</Text>
        <Text style={styles.statusValue}>{item.status}</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoLabel}>Created on</Text>
        <Text style={styles.infoValue}>
          {new Date(item.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={ticketsData}
        renderItem={renderTicket}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        onRefresh={onRefresh}
        refreshing={refreshing}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No complaints found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    marginTop: -28,
  },
  ticketCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 6,
    shadowColor: '#030303',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 5,
    overflow: 'hidden',
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeLogo: {
    width: 48,
    height: 48,
    marginRight: 12,
  },
  storeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#333',
    marginTop: 6,
    marginHorizontal: 16,
  },
  ticketDescription: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 16,
    lineHeight: 20,
  },
  infoSection: {
    margin: 4,
    marginHorizontal: 16,
  },
  infoLabel: {
    fontSize: 13,
    color: '#888',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 15,
    color: '#000',
    marginBottom: 16,
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