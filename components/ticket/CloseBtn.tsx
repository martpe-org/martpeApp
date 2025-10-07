import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  StyleSheet, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import { FetchTicketDetailType } from './api/fetch-ticket-detail-type';

interface CloseBtnProps {
  data: FetchTicketDetailType;
}

type Rating = 'THUMBS-UP' | 'THUMBS-DOWN';

export const CloseBtn: React.FC<CloseBtnProps> = ({ data }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState<Rating>('THUMBS-UP');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please provide a description');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // TODO: Implement close issue API call
      const requestBody = {
        code: 'CLOSED',
        issue_id: data.issue_id,
        short_desc: description,
        ticket_id: data._id,
        rating: rating,
      };
      
      console.log('Closing issue with data:', requestBody);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        'Success',
        'Complaint closed successfully',
        [{ text: 'OK', onPress: () => setModalVisible(false) }]
      );
      
      setDescription('');
      setRating('THUMBS-UP');
      
    } catch (error) {
      console.error('Error closing complaint:', error);
      Alert.alert('Error', 'Failed to close complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.closeButtonText}>Close Complaint</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Close Complaint</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description:</Text>
              <TextInput
                style={styles.textInput}
                multiline
                numberOfLines={4}
                placeholder="Provide reason for closing..."
                value={description}
                onChangeText={setDescription}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Are you satisfied with the resolution of your complaint?
              </Text>
              
              <View style={styles.ratingContainer}>
                <TouchableOpacity
                  style={[
                    styles.ratingButton,
                    rating === 'THUMBS-UP' && styles.ratingButtonActive
                  ]}
                  onPress={() => setRating('THUMBS-UP')}
                >
                  <Text style={[
                    styles.ratingButtonText,
                    rating === 'THUMBS-UP' && styles.ratingButtonTextActive
                  ]}>
                    👍 Yes
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.ratingButton,
                    rating === 'THUMBS-DOWN' && styles.ratingButtonActive
                  ]}
                  onPress={() => setRating('THUMBS-DOWN')}
                >
                  <Text style={[
                    styles.ratingButtonText,
                    rating === 'THUMBS-DOWN' && styles.ratingButtonTextActive
                  ]}>
                    👎 No
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setDescription('');
                  setRating('THUMBS-UP');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  closeButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  ratingButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    alignItems: 'center',
  },
  ratingButtonActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  ratingButtonText: {
    fontSize: 14,
    color: '#333',
  },
  ratingButtonTextActive: {
    color: '#fff',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#28a745',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
});
