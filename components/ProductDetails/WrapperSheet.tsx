import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SelectedOptionsType } from './CustomizationGroup';

interface WrapperSheetProps {
  visible: boolean;
  onClose: () => void;
  productName?: string;
  currentGroupIds: string[];
  customizationData: Record<string, any>;
  selectedOptions: SelectedOptionsType;
  step: number;
  onOptionChange: (groupId: string, optionId: string, name: string) => void;
  onClearGroup: (groupId: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  onAddToCart: () => void;
  isNextDisabled: () => boolean;
  hasChildGroups: boolean;
  showAddButton: boolean;
  adding: boolean;
  isEdit?: boolean;
  totalPrice?: number;
}

const WrapperSheet: React.FC<WrapperSheetProps> = ({
  visible,
  onClose,
  productName,
  currentGroupIds,
  customizationData,
  selectedOptions,
  step,
  onOptionChange,
  onClearGroup,
  onPrevious,
  onNext,
  onAddToCart,
  isNextDisabled,
  hasChildGroups,
  showAddButton,
  adding,
  isEdit = false,
  totalPrice,
}) => {
  const renderVegIcon = (dietType: string) => {
    if (dietType === 'veg') {
      return (
        <View style={[styles.dietIcon, { borderColor: '#4CAF50' }]}>
          <View style={[styles.dietDot, { backgroundColor: '#4CAF50' }]} />
        </View>
      );
    } else {
      return (
        <View style={[styles.dietIcon, { borderColor: '#F44336' }]}>
          <View style={[styles.dietDot, { backgroundColor: '#F44336' }]} />
        </View>
      );
    }
  };

  const renderOption = (groupId: string, optionId: string, group: any) => {
    const option = group[`ci_${optionId}`];
    const isMultiSelect = Number(group.config.max) > 1;
    const isSelected = selectedOptions[groupId]?.find(o => o.optionId === optionId);
    const isDisabled = !isSelected && 
      selectedOptions[groupId]?.length >= Number(group.config.max) && 
      isMultiSelect;

    return (
      <TouchableOpacity
        key={optionId}
        style={[
          styles.optionContainer,
          isSelected && styles.optionSelected,
          isDisabled && styles.optionDisabled,
        ]}
        onPress={() => !isDisabled && onOptionChange(groupId, optionId, option.name)}
        disabled={isDisabled}
      >
        <View style={styles.optionContent}>
          <View style={styles.optionLeft}>
            {renderVegIcon(option.diet_type)}
            <View style={styles.optionDetails}>
              <Text style={[styles.optionName, isDisabled && styles.disabledText]}>
                {option.name}
              </Text>
              {option.short_desc && (
                <Text style={[styles.optionDescription, isDisabled && styles.disabledText]}>
                  {option.short_desc}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.optionRight}>
            <Text style={[styles.optionPrice, isDisabled && styles.disabledText]}>
              +₹{option.price.value}
            </Text>
            <View style={styles.selectionIndicator}>
              {isMultiSelect ? (
                <View style={[
                  styles.checkbox,
                  isSelected && styles.checkboxSelected,
                  isDisabled && styles.checkboxDisabled,
                ]}>
                  {isSelected && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </View>
              ) : (
                <View style={[
                  styles.radio,
                  isSelected && styles.radioSelected,
                  isDisabled && styles.radioDisabled,
                ]}>
                  {isSelected && <View style={styles.radioDot} />}
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderGroup = (groupId: string) => {
    const group = customizationData[`cg_${groupId}`];
    if (!group) return null;

    const selectedCount = selectedOptions[groupId]?.length || 0;
    const isRequired = Number(group.config.min) > 0;
    const maxSelections = Number(group.config.max);

    return (
      <View key={groupId} style={styles.groupContainer}>
        <View style={styles.groupHeader}>
          <View style={styles.groupTitleContainer}>
            <Text style={styles.groupTitle}>
              {group.name}
              {isRequired && <Text style={styles.required}> *</Text>}
            </Text>
            {selectedOptions[groupId]?.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => onClearGroup(groupId)}
              >
                <Text style={styles.clearButtonText}>Clear</Text>
                <Ionicons name="close" size={14} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.groupSubtitle}>
            {maxSelections > 1 
              ? `Select up to ${maxSelections} (${selectedCount} selected)`
              : `Select 1 (${selectedCount} selected)`
            }
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          {group.options.map((optionId: string) => 
            renderOption(groupId, optionId, group)
          )}
        </View>
      </View>
    );
  };

  const selectedOptionsText = selectedOptions && Object.values(selectedOptions).length
    ? `Selected: ${Object.values(selectedOptions)
        .flat()
        .map((o) => o.name)
        .join(', ')}`
    : 'No options selected';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            {productName && (
              <Text style={styles.productName} numberOfLines={1}>
                {productName}
              </Text>
            )}
            <Text style={styles.headerTitle}>
              {isEdit ? 'Edit your customizations' : 'Customize your product'}
            </Text>
            {totalPrice && (
              <Text style={styles.totalPriceHeader}>
                Total: ₹{totalPrice.toFixed(2)}
              </Text>
            )}
          </View>
        </View>

        {/* Content */}
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Back button */}
          {step > 0 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={onPrevious}
              disabled={step === 0}
            >
              <Ionicons name="chevron-back" size={20} color="#f14343" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}

          {/* Progress indicator */}
          {hasChildGroups && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                Step {step + 1} of {Math.max(2, step + 2)}
              </Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${((step + 1) / Math.max(2, step + 2)) * 100}%` }
                  ]} 
                />
              </View>
            </View>
          )}

          {/* Groups */}
          {currentGroupIds.map(renderGroup)}

          {/* Continue button */}
          {hasChildGroups && (
            <TouchableOpacity
              style={[
                styles.continueButton,
                isNextDisabled() && styles.continueButtonDisabled,
              ]}
              onPress={onNext}
              disabled={isNextDisabled()}
            >
              <Text style={[
                styles.continueButtonText,
                isNextDisabled() && styles.continueButtonTextDisabled,
              ]}>
                Continue
              </Text>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={isNextDisabled() ? "#999" : "#fff"} 
              />
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.selectedText} numberOfLines={2}>
            {selectedOptionsText}
          </Text>
          
          {totalPrice && (
            <View style={styles.priceRow}>
              <Text style={styles.totalPriceText}>
                Total Price: ₹{totalPrice.toFixed(2)}
              </Text>
            </View>
          )}
          
          {showAddButton && (
            <TouchableOpacity
              style={[
                styles.addToCartButton,
                isNextDisabled() && styles.addToCartButtonDisabled,
              ]}
              onPress={onAddToCart}
              disabled={isNextDisabled() || adding}
            >
              {adding ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.addToCartButtonText}>
                  {isEdit ? 'Update Item' : 'Add to Cart'}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalPriceHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f14343',
    marginTop: 4,
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  progressContainer: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#f14343',
    borderRadius: 2,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  backButtonText: {
    color: '#f14343',
    fontSize: 16,
    marginLeft: 4,
  },
  groupContainer: {
    marginBottom: 24,
  },
  groupHeader: {
    marginBottom: 12,
  },
  groupTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textTransform: 'capitalize',
  },
  required: {
    color: '#f14343',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f14343',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 12,
    marginRight: 4,
  },
  groupSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  optionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
  },
  optionContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionSelected: {
    backgroundColor: '#f8f9ff',
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  optionLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dietIcon: {
    width: 20,
    height: 20,
    borderRadius: 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dietDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  optionDetails: {
    flex: 1,
  },
  optionName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  optionDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  disabledText: {
    color: '#999',
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionPrice: {
    fontSize: 14,
    color: '#666',
    marginRight: 12,
    fontWeight: '600',
  },
  selectionIndicator: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#f14343',
    borderColor: '#f14343',
  },
  checkboxDisabled: {
    borderColor: '#ccc',
  },
  radio: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#f14343',
  },
  radioDisabled: {
    borderColor: '#ccc',
  },
  radioDot: {
    width: 8,
    height: 8,
    backgroundColor: '#f14343',
    borderRadius: 4,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'flex-end',
    marginTop: 16,
  },
  continueButtonDisabled: {
    backgroundColor: '#ccc',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 4,
  },
  continueButtonTextDisabled: {
    color: '#999',
  },
  footer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  selectedText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  priceRow: {
    marginBottom: 8,
  },
  totalPriceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  addToCartButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addToCartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WrapperSheet;