import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SelectedOptionsType } from './CustomizationGroup';
import { styles } from './WrapperSheetForCartStyles';

interface WrapperSheetForCartProps {
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
  onUpdateCart: () => void;
  isNextDisabled: () => boolean;
  hasChildGroups: boolean;
  showUpdateButton: boolean;
  updating: boolean;
  totalPrice: number; // ✅ added totalPrice prop
}

const WrapperSheetForCart: React.FC<WrapperSheetForCartProps> = ({
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
  onUpdateCart,
  isNextDisabled,
  hasChildGroups,
  showUpdateButton,
  updating,
  totalPrice,
}) => {
  const renderVegIcon = (dietType: string) => {
    const color = dietType === 'veg' ? '#4CAF50' : '#F44336';
    return (
      <View style={[styles.dietIcon, { borderColor: color }]}>
        <View style={[styles.dietDot, { backgroundColor: color }]} />
      </View>
    );
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
        style={[styles.optionContainer, isSelected && styles.optionSelected, isDisabled && styles.optionDisabled]}
        onPress={() => !isDisabled && onOptionChange(groupId, optionId, option.name)}
        disabled={isDisabled}
      >
        <View style={styles.optionContent}>
          <View style={styles.optionLeft}>
            {renderVegIcon(option.diet_type)}
            <Text style={[styles.optionName, isDisabled && styles.disabledText]}>{option.name}</Text>
          </View>
          <View style={styles.optionRight}>
            <Text style={[styles.optionPrice, isDisabled && styles.disabledText]}>
              +₹{option.price.value}
            </Text>
            <View style={styles.selectionIndicator}>
              {isMultiSelect ? (
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected, isDisabled && styles.checkboxDisabled]}>
                  {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
              ) : (
                <View style={[styles.radio, isSelected && styles.radioSelected, isDisabled && styles.radioDisabled]}>
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
              {group.name}{isRequired && <Text style={styles.required}> *</Text>}
            </Text>
            {selectedOptions[groupId]?.length > 0 && (
              <TouchableOpacity style={styles.clearButton} onPress={() => onClearGroup(groupId)}>
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
          {group.options.map((optionId: string) => renderOption(groupId, optionId, group))}
        </View>
      </View>
    );
  };

  const selectedOptionsText = selectedOptions && Object.values(selectedOptions).length
    ? `Selected: ${Object.values(selectedOptions).flat().map((o) => o.name).join(', ')}`
    : 'No options selected';

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            {productName && <Text style={styles.productName} numberOfLines={1}>{productName}</Text>}
            <Text style={styles.headerTitle}>Edit your customizations</Text>
          </View>
        </View>

        {/* Content */}
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {step > 0 && (
            <TouchableOpacity style={styles.backButton} onPress={onPrevious} disabled={step === 0}>
              <Ionicons name="chevron-back" size={20} color="#f14343" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          {currentGroupIds.map(renderGroup)}
          {hasChildGroups && (
            <TouchableOpacity
              style={[styles.continueButton, isNextDisabled() && styles.continueButtonDisabled]}
              onPress={onNext}
              disabled={isNextDisabled()}
            >
              <Text style={[styles.continueButtonText, isNextDisabled() && styles.continueButtonTextDisabled]}>
                Continue
              </Text>
              <Ionicons name="chevron-forward" size={20} color={isNextDisabled() ? "#999" : "#fff"} />
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.selectedText} numberOfLines={2}>{selectedOptionsText}</Text>
          <Text style={styles.totalPrice}>Total: ₹{totalPrice.toFixed(2)}</Text> {/* ✅ live total price */}
          
          {showUpdateButton && (
            <TouchableOpacity
              style={[styles.updateCartButton, isNextDisabled() && styles.updateCartButtonDisabled]}
              onPress={onUpdateCart}
              disabled={isNextDisabled() || updating}
            >
              {updating ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.loadingText}>Updating...</Text>
                </View>
              ) : (
                <Text style={styles.updateCartButtonText}>Update Cart</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};



export default WrapperSheetForCart;
