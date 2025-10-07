import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Action, FetchTicketDetailType } from './api/fetch-ticket-detail-type';
import { SendMoreInfoButton } from './SendMoreInfoButton';

interface ActionCardProps {
  action: Action;
  data: FetchTicketDetailType;
  index: number;
}

export const ActionCard: React.FC<ActionCardProps> = ({ action, data, index }) => {
  const isLastAction = index === data.actions.length - 1;
  const isInfoRequested = action.descriptor.code === 'INFO_REQUESTED';

  // Use built-in JS formatting instead of date-fns
  const formattedDate = new Date(action.updated_at).toLocaleString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.code}>
          {action.descriptor.code.replace(/_/g, ' ')}
        </Text>
        <Text style={styles.timestamp}>{formattedDate}</Text>
      </View>
      
      <Text style={styles.description}>
        {action.descriptor.short_desc}
      </Text>
      
      <Text style={styles.createdBy}>
        Created by: {action.actor_details.name}
      </Text>
      
      {/* Show SendMoreInfoButton only for the last INFO_REQUESTED action */}
      {isLastAction && isInfoRequested && (
        <View style={styles.actionButton}>
          <SendMoreInfoButton
            data={data}
            info_type="INFO001"
            ref_id={action.id}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  code: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textTransform: 'capitalize',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  createdBy: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  actionButton: {
    marginTop: 12,
    alignItems: 'flex-start',
  },
});
