import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FetchTicketDetailType } from './api/fetch-ticket-detail-type';
import { SendMoreInfoForm } from './SendMoreInfoForm';


interface SendMoreInfoButtonProps {
  data: FetchTicketDetailType;
  info_type: 'INFO001' | 'INFO002' | 'INFO003';
  ref_id: string;
}

export const SendMoreInfoButton: React.FC<SendMoreInfoButtonProps> = ({
  data,
  info_type,
  ref_id,
}) => {
  const [showForm, setShowForm] = useState(false);

  if (showForm) {
    return (
      <SendMoreInfoForm
        data={data}
        info_type={info_type}
        ref_id={ref_id}
        onClose={() => setShowForm(false)}
      />
    );
  }

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => setShowForm(true)}
    >
      <Text style={styles.buttonText}>Send Info</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
});
