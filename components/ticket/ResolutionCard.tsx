import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { FetchTicketDetailType, ParsedResolution } from './api/fetch-ticket-detail-type';

interface ResolutionCardProps {
  resolution: ParsedResolution;
  data: FetchTicketDetailType;
  index: number;
}

export const ResolutionCard: React.FC<ResolutionCardProps> = ({ 
  resolution, 
  data, 
  index 
}) => {
  const handleAcceptResolution = (optionId: string) => {
    Alert.alert(
      'Accept Resolution',
      'Are you sure you want to accept this resolution?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Accept', 
          onPress: () => {
            // TODO: Implement accept resolution API call
            console.log('Accepting resolution:', optionId);
          }
        }
      ]
    );
  };

  const handleRejectResolution = (optionId: string) => {
    Alert.alert(
      'Reject Resolution',
      'Are you sure you want to reject this resolution?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reject', 
          style: 'destructive',
          onPress: () => {
            // TODO: Implement reject resolution API call
            console.log('Rejecting resolution:', optionId);
          }
        }
      ]
    );
  };

  // Helper to format date using native JS (no date-fns)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.resolutionTitle}>
          {resolution.descriptor.short_desc}
        </Text>
        <Text style={styles.proposedBy}>
          Proposed by: {resolution.proposed_by}
        </Text>
      </View>

      {resolution.options.map((option) => (
        <View key={option.id} style={styles.optionContainer}>
          <View style={styles.optionHeader}>
            <Text style={styles.optionCode}>
              {option.descriptor.code}
            </Text>
            {option.tags.resolution_details?.refund_amount && (
              <Text style={styles.refundAmount}>
                Refund amount: ₹{option.tags.resolution_details.refund_amount}
              </Text>
            )}
          </View>
          
          <Text style={styles.optionDescription}>
            {option.descriptor.short_desc}
          </Text>
          
          <Text style={styles.createdAt}>
            Created at: {formatDate(option.updated_at)}
          </Text>

          {option.accepted ? (
            <View style={styles.acceptedBadge}>
              <Text style={styles.acceptedText}>✓ Accepted</Text>
            </View>
          ) : (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.button, styles.acceptButton]}
                onPress={() => handleAcceptResolution(option.id)}
              >
                <Text style={styles.acceptButtonText}>Accept</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.rejectButton]}
                onPress={() => handleRejectResolution(option.id)}
              >
                <Text style={styles.rejectButtonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  header: {
    marginBottom: 12,
  },
  resolutionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  proposedBy: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  optionContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionCode: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  refundAmount: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '500',
  },
  optionDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  createdAt: {
    fontSize: 12,
    color: '#888',
    marginBottom: 12,
  },
  acceptedBadge: {
    backgroundColor: '#d4edda',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  acceptedText: {
    fontSize: 12,
    color: '#155724',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
  },
  acceptButton: {
    backgroundColor: '#28a745',
  },
  acceptButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 14,
  },
  rejectButton: {
    backgroundColor: '#dc3545',
  },
  rejectButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 14,
  },
});
