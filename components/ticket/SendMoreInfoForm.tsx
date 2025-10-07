import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { FetchTicketDetailType } from './api/fetch-ticket-detail-type';

interface SendMoreInfoFormProps {
  data: FetchTicketDetailType;
  info_type: 'INFO001' | 'INFO002' | 'INFO003';
  ref_id: string;
  onClose: () => void;
}

export const SendMoreInfoForm: React.FC<SendMoreInfoFormProps> = ({
  data,
  info_type,
  ref_id,
  onClose,
}) => {
  const [description, setDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getFileTypeLabel = () => {
    switch (info_type) {
      case 'INFO001': return 'images';
      case 'INFO002': return 'videos';
      case 'INFO003': return 'invoice (as image)';
      default: return 'files';
    }
  };

  const handleFilePicker = async () => {
    try {
      let mediaTypes = ImagePicker.MediaTypeOptions.All;
      if (info_type === 'INFO001') mediaTypes = ImagePicker.MediaTypeOptions.Images;
      else if (info_type === 'INFO002') mediaTypes = ImagePicker.MediaTypeOptions.Videos;
      else if (info_type === 'INFO003') mediaTypes = ImagePicker.MediaTypeOptions.Images;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedFiles(result.assets);
      }
    } catch (error) {
      console.error('File picker error:', error);
      Alert.alert('Error', 'Failed to pick files');
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (files: any[]) => {
    try {
      const fileNames = files.map(file => file.name || `file_${Date.now()}`);
      console.log('Getting presigned URLs for:', fileNames);
      console.log('Uploading files...');
      return files.map((file, index) => `https://example.com/uploaded/${fileNames[index]}`);
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const requestBody: any = {
        issue_id: data.issue_id,
        code: 'INFO_PROVIDED',
        ref_id,
        short_desc: description || 'sharing requested info',
        ticket_id: data._id,
      };

      if (selectedFiles.length > 0) {
        const uploadedUrls = await uploadFiles(selectedFiles);

        if (info_type === 'INFO001') {
          requestBody.images = uploadedUrls.map((url: string) => ({
            url,
            size_type: 'xs',
          }));
        } else {
          requestBody.media = uploadedUrls.map((url: string) => ({ url }));
        }
      }

      console.log('Submitting form with data:', requestBody);
      await new Promise(resolve => setTimeout(resolve, 1000));

      Alert.alert('Success', 'Information submitted successfully');
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Error', 'Failed to submit information');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Send Additional Info</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* File Upload Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upload {getFileTypeLabel()}</Text>
            <Text style={styles.sectionDescription}>
              Click or drag files here to upload
            </Text>

            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleFilePicker}
            >
              <Text style={styles.uploadButtonText}>
                Select {getFileTypeLabel()}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Selected Files Preview */}
          {selectedFiles.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Selected Files</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {selectedFiles.map((file, index) => (
                  <View key={index} style={styles.filePreview}>
                    {file.uri && (
                      <Image source={{ uri: file.uri }} style={styles.previewImage} />
                    )}
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeFile(index)}
                    >
                      <Text style={styles.removeButtonText}>×</Text>
                    </TouchableOpacity>
                    <Text style={styles.fileName} numberOfLines={1}>
                      {file.fileName || file.name || `File ${index + 1}`}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Description Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description (optional)</Text>
            <TextInput
              style={styles.textInput}
              multiline
              numberOfLines={4}
              placeholder="Add any additional information..."
              value={description}
              onChangeText={setDescription}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.submitButtonText}>Submitting...</Text>
              </>
            ) : (
              <Text style={styles.submitButtonText}>Submit</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: { fontSize: 20, fontWeight: '600', color: '#333' },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: { fontSize: 20, color: '#666' },
  content: { flex: 1, padding: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#333' },
  sectionDescription: { fontSize: 14, color: '#666', marginBottom: 12 },
  uploadButton: {
    borderWidth: 2,
    borderColor: '#007bff',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 20,
    alignItems: 'center',
  },
  uploadButtonText: { color: '#007bff', fontWeight: '500' },
  filePreview: { marginRight: 12, alignItems: 'center', position: 'relative' },
  previewImage: { width: 80, height: 80, borderRadius: 8 },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ff4757',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  fileName: { fontSize: 12, color: '#666', marginTop: 4, maxWidth: 80, textAlign: 'center' },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cancelButton: { backgroundColor: '#6c757d' },
  cancelButtonText: { color: '#fff', fontWeight: '500' },
  submitButton: { backgroundColor: '#28a745' },
  submitButtonText: { color: '#fff', fontWeight: '500', marginLeft: 8 },
});
