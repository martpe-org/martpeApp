import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Action, FetchTicketDetailType } from './api/fetch-ticket-detail-type';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ActionCardProps {
  action: Action;
  data: FetchTicketDetailType;
  index: number;
}

export const ActionCard: React.FC<ActionCardProps> = ({ action, data, index }) => {
  // Format date
  const formattedDate = new Date(action.updated_at).toLocaleString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const getStatusColor = (code: string) => {
    switch (code.toLowerCase()) {
      case 'open': return '#4ade80';
      case 'processing': return '#4ade80';
      case 'closed': return '#4caf50';
      case 'resolved': return '#4caf50';
      default: return '#4ade80';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.leftIndicator}>
        <View style={[styles.dot, { backgroundColor: getStatusColor(action.descriptor.code) }]} />
        {index < (data.actions?.length || 0) - 1 && <View style={styles.line} />}
      </View>
      <View style={styles.content}>
        <Text style={styles.code}>
          {action.descriptor.code.replace(/_/g, ' ')}
        </Text>
        <Text style={styles.description}>
          {action.descriptor.short_desc}
        </Text>
        <Text style={styles.createdBy}>
          created by: {action.actor_details.name}
        </Text>
        <Text style={styles.timestamp}>created at: {formattedDate}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  leftIndicator: {
    width: 30,
    alignItems: 'center',
    paddingTop: 4,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#e0e0e0',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingBottom: 16,
  },
  code: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 16,
    color: '#000',
    marginBottom: 4,
  },
  createdBy: {
    fontSize: 16,
    color: '#000',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 16,
    color: '#000',
  },
});