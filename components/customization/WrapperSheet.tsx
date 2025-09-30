import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SelectedOptionsType } from '../customization/CustomizationGroup';
import { styles } from './WrapperSheetStyles';

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
            <Text style={[styles.optionName, isDisabled && styles.disabledText]}>
              {option.name}
            </Text>
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
          {isRequired && (
            <Text style={styles.groupSubtitle}>
              ({selectedCount} / {group.config.max})
            </Text>
          )}
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
      transparent={true} // Make background transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
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
                <Text style={styles.headerTitle}>Customize your product</Text>
              </View>
            </View>

            {/* Scrollable Content */}
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
                  <Text
                    style={[
                      styles.continueButtonText,
                      isNextDisabled() && styles.continueButtonTextDisabled,
                    ]}
                  >
                    Continue
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={isNextDisabled() ? '#999' : '#fff'}
                  />
                </TouchableOpacity>
              )}
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.selectedText} numberOfLines={2}>
                {selectedOptionsText}
              </Text>

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
                    <Text style={styles.addToCartButtonText}>Add</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>

  );
};



export default WrapperSheet;