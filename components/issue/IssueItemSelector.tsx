import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from "react-native";
import { OrderItem } from "../order/fetch-order-detail-type";

interface Props {
  items: OrderItem[];
  value: string;
  onChange: (val: string) => void;
}

export default function IssueItemSelector({ items, value, onChange }: Props) {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const selectedItem = items.find(item => item.catalog_id === value);
  const displayText = selectedItem ? selectedItem.name : "Select an item";

  const handleSelect = (itemId: string) => {
    onChange(itemId);
    setIsModalVisible(false);
  };

  const renderItem = ({ item }: { item: OrderItem }) => (
    <TouchableOpacity
      style={[
        styles.optionItem,
        item.catalog_id === value && styles.selectedOption
      ]}
      onPress={() => handleSelect(item.catalog_id)}
    >
      <Text style={[
        styles.optionText,
        item.catalog_id === value && styles.selectedOptionText
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Item</Text>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={[
          styles.selectorText,
          !value && styles.placeholderText
        ]}>
          {displayText}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select an Item</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={[{ catalog_id: "", name: "Select an item" }, ...items]}
              keyExtractor={(item) => item.catalog_id || "default"}
              renderItem={renderItem}
              style={styles.optionsList}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  selector: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectorText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  placeholderText: {
    color: '#999',
  },
  arrow: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '80%',
    maxHeight: '60%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  optionsList: {
    maxHeight: 300,
  },
  optionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedOption: {
    backgroundColor: '#e3f2fd',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    color: '#1976d2',
    fontWeight: '500',
  },
});