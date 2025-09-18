import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from "react-native";
import { IssueTaxonomy } from "@/constants/IGM_constants";

interface Props {
  level: string;
  itemId: string;
  value: string;
  onChange: (val: string) => void;
}

interface CategoryItem {
  code: string;
  label: string;
}

export default function IssueCategorySelector({ level, itemId, value, onChange }: Props) {
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Disable if no level selected or if level is ITEM but no item selected
  const isDisabled = !level || (level === "ITEM" && !itemId);
  
  // Get available categories based on the selected level
  const availableCategories = level && IssueTaxonomy[level as keyof typeof IssueTaxonomy] 
    ? IssueTaxonomy[level as keyof typeof IssueTaxonomy] 
    : [];

  const selectedCategory = availableCategories.find(item => item.code === value);
  const displayText = selectedCategory ? selectedCategory.label : "Select issue category";

  const handleSelect = (categoryCode: string) => {
    onChange(categoryCode);
    setIsModalVisible(false);
  };

  const handlePress = () => {
    if (!isDisabled) {
      setIsModalVisible(true);
    }
  };

  const renderItem = ({ item }: { item: CategoryItem }) => (
    <TouchableOpacity
      style={[
        styles.optionItem,
        item.code === value && styles.selectedOption
      ]}
      onPress={() => handleSelect(item.code)}
    >
      <Text style={[
        styles.optionText,
        item.code === value && styles.selectedOptionText
      ]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const optionsData = [
    { code: "", label: "Select issue category" },
    ...availableCategories
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.label, isDisabled && styles.labelDisabled]}>
        Issue Category
      </Text>
      <TouchableOpacity
        style={[
          styles.selector,
          isDisabled && styles.selectorDisabled
        ]}
        onPress={handlePress}
        disabled={isDisabled}
      >
        <Text style={[
          styles.selectorText,
          !value && styles.placeholderText,
          isDisabled && styles.disabledText
        ]}>
          {displayText}
        </Text>
        <Text style={[
          styles.arrow,
          isDisabled && styles.disabledText
        ]}>
          ▼
        </Text>
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
              <Text style={styles.modalTitle}>Select Issue Category</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={optionsData}
              keyExtractor={(item) => item.code || "default"}
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
  labelDisabled: {
    color: '#999',
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
  selectorDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ddd',
  },
  selectorText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  placeholderText: {
    color: '#999',
  },
  disabledText: {
    color: '#ccc',
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